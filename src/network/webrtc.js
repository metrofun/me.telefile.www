var Signaller = require('./signaller.js'),
    ReactiveTransport = require('./reactive-transport.js'),
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    Rx = require('rx'),
    RSVP = require('rsvp');

try {
    RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
} catch (e) {
    console.log(e);
}

/**
 * Creates a new WebRTC session,
 * and offers observer/observable interface
 * for sending data thought RTCDataChannel medium.
 *
 * @constructor
 *
 * @param {String|Number} [pin] When present, joins existing peer.
 */
function ReactiveWebrtc(pin) {
    this._pin = pin;
    this._isOffering = !!pin;
    this._pc = new RTCPeerConnection({
        iceServers: require('./ice-servers.js')
    });

    //we need to request a data channel before creating an offer,
    //otherwise datachannel won't be negotiated between peers
    this._initDataChannel();
    this._initReactiveTransport();
    this._initSignaller();
    this._initReadStream();
    this._initWriteBus();

    if (this._isOffering) {
        this._pc.createOffer(
            this._onLocalSdp.bind(this),
            this._onInternalError.bind(this),
            this._mediaConstraints
        );
    }
}
ReactiveWebrtc.prototype = {
    /**
     * Returns current session pin
     *
     * @returns {RSVP.Promise}
     */
    getPin: function () {
        return this._signaller.getPin();
    },
    getWriteBus: function () {
        return this._writeBusSubject;
    },
    getReadStream: function () {
        return this._readStreamSubject.asObservable();
    },
    _initWriteBus: function () {
        var self = this,
            inSubject = new Rx.Subject(),
            inPausedSubject = new Rx.Subject(),
            pauser = new Rx.Subject();

        this._writeBusOutSubject = new Rx.Subject();

        inSubject.pausableBuffered(pauser).subscribe(inPausedSubject);

        RSVP.all([this._reactiveTransportOpening, this._dataChannelOpening]).then(function () {
            var transport = arguments[0],
                dataChannel = arguments[1],
                transportWriteBus = transport.getWriteBus(),
                bufferingPauser = self._createBufferingPauser(dataChannel);

            inPausedSubject.subscribe(bufferingPauser);
            bufferingPauser.subscribe(pauser);

            inPausedSubject.subscribe(function (msg) {
                transportWriteBus.onNext(msg);
            }, function (e) {
                transportWriteBus.onError(e);
                self._disposeSignaller();
            }, function () {
                transportWriteBus.onCompleted();
                self._disposeSignaller();
            });
            inPausedSubject.subscribe(transport.getWriteBus());

            transport.getWriteBus().subscribe(self._writeBusOutSubject);
        });

        this._writeBusSubject = Rx.Subject.create(inSubject, this._writeBusOutSubject);
    },
    _initReadStream: function () {
        this._readStreamSubject = new Rx.Subject();

        this._reactiveTransportOpening.then(function (transport) {
            transport.getReadStream().subscribe(this._readStreamSubject);
        }.bind(this));
    },
    _initSignaller: function () {
        var self = this;

        this._signaller = new Signaller(this._pin);

        this._signallerSubscription = this._signaller.getReadStream().subscribe(function (data) {
            if (data.sdp) {
                self._pc.setRemoteDescription(
                    new RTCSessionDescription(data.sdp),
                    function () {
                        if (!self._isOffering) {
                            self._pc.createAnswer(
                                self._onLocalSdp.bind(self),
                                self._onInternalError.bind(self),
                                self._mediaConstraints
                            );
                        }
                    },
                    self._onInternalError.bind(self)
                );
            } else if (data.candidate) {
                self._pc.addIceCandidate(
                    new RTCIceCandidate(data.candidate),
                    undefined,
                    self._onInternalError.bind(self)
                );
            }
        }, this._onInternalError.bind(this));

        this._pc.onicecandidate = function (e) {
            if (e.candidate) {
                self._signaller.getWriteBus().onNext({candidate: e.candidate});
            }
        };
    },
    _initDataChannel: function () {
        var self = this;

        this._dataChannelOpening = new RSVP.Promise(function (resolve, reject) {
            var errorSubscription;

            if (self._isOffering) {
                resolve(self._pc.createDataChannel('default', {
                    ordered: true
                }));
            } else {
                errorSubscription = self.getWriteBus()
                    .concat(self.getReadStream())
                    .subscribeOnError(function (e) { reject(e); });

                self._pc.ondatachannel = function (e) {
                    resolve(e.channel);
                    errorSubscription.dispose();
                };
            }
        });
        // after dataChannel established,
        // we no longer care about signaller
        // TODO implement signalling over data channel
        this._dataChannelOpening.then(this._disposeSignaller.bind(this));
    },
    _initReactiveTransport: function () {
        this._reactiveTransportOpening = this._dataChannelOpening.then(function (dataChannel) {
            return new ReactiveTransport(dataChannel);
        });
    },
    _disposeSignaller: function () {
        if (this._signallerSubscription) {
            this._signallerSubscription.dispose();
            this._signallerSubscription = null;
        }
        if (this._signaller) {
            this._signaller.getWriteBus().onCompleted();
            this._signaller = null;
        }
    },
    _onInternalError: function (e) {
        this._disposeSignaller();
        this._readStreamSubject.onError(e);
        this._writeBusOutSubject.onError(e);
        this._reactiveTransportOpening.then(function (reactiveTransport) {
            reactiveTransport.getWriteBus().onError(e);
        });
    },
    _createBufferingPauser: function (dataChannel) {
        var inSubject = new Rx.Subject(),
            outSubject = new Rx.Subject();

        inSubject.flatMapLatest(function () {
            return (dataChannel.bufferedAmount === 0) || Rx.Observable
                .return(false)
                .concat(Rx.Observable.timer(0, 300)
                    .skipWhile(function () {
                        return dataChannel.bufferedAmount > 0;
                    })
                    .map(Boolean)
                    .take(1)
                );
        }).subscribe(outSubject);

        return Rx.Subject.create(inSubject, outSubject);
    },
    _onLocalSdp: function (sdp) {
        this._pc.setLocalDescription(sdp, function () {
            this._signaller.getObserver().onNext({sdp: sdp});
        }.bind(this), this._onInternalError.bind());
    },
    _mediaConstraints: {
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }
};
module.exports = ReactiveWebrtc;
