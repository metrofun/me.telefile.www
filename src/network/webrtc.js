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
        this._pc.createOffer(this._onLocalSdp.bind(this), function (e) {
            console.error(e);
        }, this._mediaConstraints);
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
    _initWriteBus: function () {
        var observer, observable, controller,
            queue, subscription;

        if (!this._observerSubject) {
            observer = new Rx.Subject();
            controller = new Rx.Subject();
            observable = new Rx.Subject();
            queue = [];

            //we should buffer all data,
            //untill RTCDataChannel becomes available
            subscription = observer.subscribe(function (data) {
                queue.push(data);
            }, function (e) {
                observable.onError(e);
            }, function () {
                observable.onCommpleted();
            });

            this._initDataChannel().then(function (dataChannel) {
                this._reactiveTransport = new ReactiveTransport(dataChannel);
                var transportObserver = this._reactiveTransport.getObserver();

                Rx.Observable
                    .fromArray(queue)
                    .concat(observer)
                    .concatMap(this._deferTillBufferEmpty(dataChannel))
                    .subscribe(transportObserver);

                subscription.dispose();
                queue = null;

                transportObserver.subscribe(observable);
            }.bind(this));

            this._observerSubject = Rx.Subject.create(observer, observable);
        }

        return this._observerSubject;
    },
    getWriteBus: function () {
    },
    getReadStream: function () {
        return this._readStreamSubject.asObservable();
    },
    _initReadStream: function () {
        this._readStreamSubject = new Rx.Subject();

        this._reactiveTransportOpening.then(function (transport) {
            transport.getReadStream().subscribe(this._readStreamSubject);
        }.bind(this));
    },
    terminate: function () {
        this._pc.close();
        this._pc = undefined;
        if (this._reactiveTransport) {
            this._reactiveTransport.terminate();
            this._reactiveTransport = null;
        }
        if (this._signaller) {
            this._signaller.terminate();
            this._signaller = null;
        }
    },
    _initSignaller: function () {
        var self = this;

        this._signaller = new Signaller(this._pin);

        this._signallerSubscription = this._signaller.getReadStream().subscribe(function (data) {
            if (data.sdp) {
                self._pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

                if (!self._isOffering) {
                    self._pc.createAnswer(self._onLocalSdp.bind(self), function (e) {
                        // TODO
                    }, self._mediaConstraints);
                }
            } else if (data.candidate) {
                self._pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        }, function (e) {
            // TODO
        });

        this._pc.onicecandidate = function (e) {
            if (e.candidate) {
                self._signaller.getWriteBus().onNext({candidate: e.candidate});
            }
        };
    },
    _initDataChannel: function () {
        var self = this;

        this._dataChannelOpening = new RSVP.Promise(function (resolve) {
            // TODO reject?
            if (self._isOffering) {
                resolve(self._pc.createDataChannel('default', {
                    ordered: true
                }));
            } else {
                self._pc.ondatachannel = function (e) {
                    resolve(e.channel);
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
        this._signallerSubscription.dispose();
        this._signallerSubscription = null;
    },
    /**
     * Returns data callback,
     * that returns a promise,
     * which resolves when dataChannel buffer amount is empty
     *
     * @param {RTCDataChannel} dataChannel
     *
     * @returns {Function} data callback
     */
    _deferTillBufferEmpty: function (dataChannel) {
        return function (data) {
            //make things a bit faster, by starting timer only if needed
            if (dataChannel.bufferedAmount === 0) {
                return Rx.Observable.return(data);
            } else {
                // every 300ms after 100ms
                return Rx.Observable.timer(100, 300).map(function () {
                    return dataChannel.bufferedAmount > 0;
                }).takeWhile(function (bufferedAmount) {
                    return bufferedAmount > 0;
                //empty sequence never resolves
                }).concat(Rx.Observable.return('nonempy')).toPromise().then(function () {
                    return data;
                });
            }
        };
    },
    _onLocalSdp: function (sdp) {
        this._pc.setLocalDescription(sdp);
        this._signaller.getObserver().onNext({sdp: sdp});
    },
    _mediaConstraints: {
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }
};
module.exports = ReactiveWebrtc;
