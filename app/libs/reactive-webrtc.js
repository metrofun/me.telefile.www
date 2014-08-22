var ReactiveSignaller = require('./reactive-signaller.js'),
    ReactiveTransport = require('./reactive-transport.js'),
    Rx = require('rx'),
    RSVP = require('rsvp');

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
    //lazy eveluation, because this code may be
    //eveluated on server, where window is undefined
    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

    this._pin = pin;
    this._isWebrtcCaller = !!pin;
    this._pc = new RTCPeerConnection({
        iceServers: require('./ice-servers.js')
    });

    //we need to request a data channel before creating an offer,
    //otherwise datachannel won't be negotiated between peers
    this._getDataChannel();
    this._enableSignaller();

    if (this._isWebrtcCaller) {
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
        return this._reactiveSignaller.getPin();
    },
    getObserver: function () {
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

            this._getDataChannel().then(function (dataChannel) {
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
    getObservable: function () {
        if (!this._observable) {
            this._observable = new Rx.Subject();

            this._getDataChannel().then(function (dataChannel) {
                this._reactiveTransport = new ReactiveTransport(dataChannel);

                this._reactiveTransport.getObservable().subscribe(this._observable);
            }.bind(this));
        }

        return this._observable;
    },
    terminate: function () {
        this._pc.close();
        this._pc = undefined;
        if (this._reactiveTransport) {
            this._reactiveTransport.terminate();
            this._reactiveTransport = null;
        }
        if (this._reactiveSignaller) {
            this._reactiveSignaller.terminate();
            this._reactiveSignaller = null;
        }
    },
    _enableSignaller: function () {
        var self = this, observable;

        this._reactiveSignaller = new ReactiveSignaller(this._pin);

        observable = this._reactiveSignaller.getObservable();

        this._signallerErrorSubscription = observable.subscribe(undefined, function (e) {
            console.log('ReactiveSignaller onError:', e);
            self.getObservable().onError(e);
            self.getObserver().onError(e);
        });

        observable.pluck('sdp').filter(Boolean).take(1).subscribe(function (sdp) {
            var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

            self._pc.setRemoteDescription(new RTCSessionDescription(sdp));

            if (!self._isWebrtcCaller) {
                self._pc.createAnswer(
                    self._onLocalSdp.bind(self),
                    function (e) {
                        console.error(e);
                    },
                    self._mediaConstraints
                );
            }
        });
        observable.pluck('candidate').filter(Boolean).subscribe(function (candidate) {
            var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

            self._pc.addIceCandidate(new RTCIceCandidate(candidate));
        });


        this._pc.onicecandidate = function (e) {
            if (e.candidate) {
                self._reactiveSignaller.getObserver().onNext({candidate: e.candidate});
            }
        };
    },
    /**
     * Resolves with a RTCDataChannel
     *
     * @returns {RSVP.Promise}
     */
    _getDataChannel: function () {
        var self;

        if (!this._dataChannelPromise) {
            self = this;

            this._dataChannelPromise = new RSVP.Promise(function (resolve) {
                if (self._isWebrtcCaller) {
                    resolve(self._pc.createDataChannel('default', {
                        ordered: true
                    }));
                } else {
                    self._pc.ondatachannel = function (e) {
                        resolve(e.channel);
                    };
                }
            });
            this._dataChannelPromise.then(function () {
                // after dataChannel established,
                // we no longer care about signaller
                // TODO implement signalling over data channel
                self._signallerErrorSubscription.dispose();
                delete self._signallerErrorSubscription;
            });
        }
        return this._dataChannelPromise;
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
        this._reactiveSignaller.getObserver().onNext({sdp: sdp});
    },
    _mediaConstraints: {
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }
};
module.exports = ReactiveWebrtc;
