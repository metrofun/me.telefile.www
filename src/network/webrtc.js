Error.stackTraceLimit = Infinity;
var Signaller = require('./signaller.js'),
    ReactiveTransport = require('./reactive-transport.js'),
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    scheduler,
    Rx = require('rx');

// window might be undefined
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

    this._initSignaller();
    //we need to request a data channel before creating an offer,
    //otherwise datachannel won't be negotiated between peers
    this._initDataChannel();
    this._initReactiveTransport();
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
     * @returns {Promise}
     */
    getPin: function () {
        return this._signaller.getPin();
    },
    getWriteBus: function () {
        return this._writeBusSubject;
    },
    getReadStream: function () {
        return this._readStreamSubject;
    },
    _initWriteBus: function () {
        var pauser = new Rx.Subject(),
            proxySubject = new Rx.Subject(),
            inSubject = new Rx.Subject();

        this._writeBusOutSubject = new Rx.Subject();

        inSubject
            // pausableBuffered flushes queue when source completes,
            // so we merge inSubject with a sequence
            //  which completes after first unpause
            .merge(pauser.filter(Boolean).take(1).ignoreElements())
            .pausableBuffered(pauser)
            // signaller might be already disposed
            .doOnError(this._disposeSignaller.bind(this))
            .doOnCompleted(this._disposeSignaller.bind(this))
            .subscribe(proxySubject);


        this._reactiveTransportOpening.concatMap(function (reactiveTransport) {
            var writeBus = reactiveTransport.getWriteBus();

            proxySubject.subscribe(writeBus);

            return writeBus;
        }).subscribe(this._writeBusOutSubject);

        this._dataChannelCreating.concatMap(function (dataChannel) {
            return this._createBufferingPauser(
                dataChannel,
                proxySubject
            ).startWith(true);
        }.bind(this)).subscribe(pauser);

        this._writeBusSubject = Rx.Subject.create(inSubject, this._writeBusOutSubject);
    },
    _initReadStream: function () {
        this._readStreamSubject = new Rx.Subject();

        this._reactiveTransportOpening.concatMap(function (reactiveTransport) {
            return reactiveTransport.getReadStream();
        }).subscribe(this._readStreamSubject);
    },
    _initSignaller: function () {
        var self = this;

        this._signaller = new Signaller(this._pin);

        this._signallerDisposable = new Rx.CompositeDisposable(
            this._signaller.getReadStream().subscribe(function (data) {
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
                        function () {},
                        self._onInternalError.bind(self)
                    );
                }
            }, this._onInternalError.bind(this)),
            this._signaller.getWriteBus().subscribeOnError(this._onInternalError.bind(this))
        );

        this._pc.onicecandidate = function (e) {
            if (e.candidate) {
                self._signaller.getWriteBus().onNext({candidate: e.candidate});
            }
        };
    },
    _initDataChannel: function () {
        this._dataChannelCreating = new Rx.ReplaySubject();

        if (this._isOffering) {
            this._dataChannelCreating.onNext(this._pc.createDataChannel('default', {
                ordered: true
            }));
            this._dataChannelCreating.onCompleted();
        } else {
            this._pc.ondatachannel = function (e) {
                this._dataChannelCreating.onNext(e.channel);
                this._dataChannelCreating.onCompleted();
            }.bind(this);
        }
    },
    _initReactiveTransport: function () {
        this._reactiveTransportOpening = new Rx.ReplaySubject();

        this._dataChannelCreating.map(function (dataChannel) {
            var reactiveTransport = new ReactiveTransport(dataChannel);

            // Unsubscribe from Signaller errors,
            // after dataChannel has been established
            reactiveTransport
                .getOpenPauser().take(1)
                .subscribeOnCompleted(this._disposeSignaller.bind(this));

            return reactiveTransport;
        }.bind(this)).subscribe(this._reactiveTransportOpening);
    },
    _disposeSignaller: function (e) {
        if (e) {
            this._signaller.getWriteBus().onError(e);
        } else {
            this._signaller.getWriteBus().onCompleted();
        }
        this._signallerDisposable.dispose();
    },
    _onInternalError: function (e) {
        this._disposeSignaller(e);
        this._readStreamSubject.onError(e);
        this._writeBusOutSubject.onError(e);
        this._reactiveTransportOpening.subscribe(function (reactiveTransport) {
            reactiveTransport.getWriteBus().onError(e);
        });
    },
    _createBufferingPauser: function (dataChannel, control) {
        return control.flatMapLatest(function () {
            return Rx.Observable
                // scheduler is here for easier testing,
                // it will be mocked in unit tests
                .timer(0, 100, scheduler)
                .startWith('immidiate')
                .map(function () {
                    return dataChannel.bufferedAmount === 0;
                })
                .takeWhile(function (isEmpty) {
                    return !isEmpty;
                })
                .concat(Rx.Observable.return(true));
        }).distinctUntilChanged();
    },
    _onLocalSdp: function (sdp) {
        this._pc.setLocalDescription(sdp, function () {
            this._signaller.getWriteBus().onNext({sdp: sdp});
        }.bind(this), this._onInternalError.bind(this));
    },
    _mediaConstraints: {
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }
};

ReactiveWebrtc.isSupported = function() {
    var domPrefixes  = ['', 'webkit', 'moz', 'o', 'ms'];

    for (var i = 0, l = domPrefixes.length; i < l; i++) {
        var PeerConnectionConstructor = window[domPrefixes[i] + 'RTCPeerConnection'];

        if (PeerConnectionConstructor) {
            var peerConnection = new PeerConnectionConstructor({
                'iceServers': [{ 'url': 'stun:0' }]
            });

            return 'createDataChannel' in peerConnection;
        }
    }
    return false;
};

module.exports = ReactiveWebrtc;
