var ReactiveSignaller = require('./reactive-signaller.js'),
    ReactiveTransport = require('./reactive-transport.js'),
    Rx = require('rx'),
    RSVP = require('rsvp');

function ReactiveWebrtc(channelId) {
    this._channelId = channelId;
    this._isCaller = !!channelId;
    this._pc = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    });

    //request data channel before creating and offer
    this._getDataChannel();
    this._enableSignaller();

    if (this._isCaller) {
        this._pc.createOffer(this._onLocalSdp.bind(this), null, this._mediaConstraints);
    }
}
ReactiveWebrtc.prototype = {
    _enableSignaller: function () {
        var self = this, observable;

        this._reactiveSignaller = new ReactiveSignaller(this._channelId);
        observable = this._reactiveSignaller.getObservable();

        observable.pluck('sdp').filter(Boolean).take(1).subscribe(function (sdp) {
            self._pc.setRemoteDescription(new RTCSessionDescription(sdp));

            if (!self._isCaller) {
                self._pc.createAnswer(
                    self._onLocalSdp.bind(self),
                    null,
                    this._mediaConstraints
                );
            }
        });
        observable.pluck('candidate').filter(Boolean).subscribe(function (candidate) {
            self._pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        this._pc.onicecandidate = function (e) {
            if (e.candidate) {
                self._reactiveSignaller.getObserver().onNext({candidate: e.candidate});
            }
        };
    },
    _getReactiveTransport: function () {
        if (!this._transportPromise) {
            this._transportPromise = this._getDataChannel().then(function (ReactiveWebrtc) {
                return new ReactiveTransport(ReactiveWebrtc);
            });
        }
        return this._transportPromise;
    },
    _getDataChannel: function () {
        if (!this._dataChannelPromise) {
            this._dataChannelPromise = new RSVP.Promise(function (resolve) {
                if (this._isCaller) {
                    resolve(this._pc.createDataChannel('default', {
                        ordered: true
                    }));
                } else {
                    this._pc.ondatachannel = function (e) {
                        resolve(e.channel);
                    };
                }
            }.bind(this));
        }
        return this._dataChannelPromise;
    },
    getObserver: function () {
        var observerSubject, observableSubject, pausedObserverSubject, pauser;

        if (!this._observerSubject) {
            observerSubject = new Rx.Subject();
            pausedObserverSubject = observerSubject
                .pausableBuffered(pauser)
                .map(this._emptyDataChannelQueue, this);

            observableSubject = new Rx.Subject();

            this._getReactiveTransport().then(function (reactiveTransport) {
                pausedObserverSubject.subscribe(reactiveTransport.getObserver());
                reactiveTransport.getObserver().subscribe(observerSubject);

                pauser.onNext(true);
            });

            this._observerSubject = Rx.Subject.create(observerSubject, observerSubject);
        }

        return this._observerSubject;
    },
    _emptyDataChannelQueue: function (data) {
        return this._getDataChannel().then(function (ReactiveWebrtc) {
            return new RSVP.Promise(function (resolve) {
                // TODO save another event loop
                Rx.Observable.timer(0, 200).takeUntil(function () {
                    return ReactiveWebrtc.bufferedAmount === 0;
                }).subscribe(undefined, undefined, function () {
                    resolve(data);
                });
            });
        });
    },
    getObservable: function () {
        if (!this._observable) {
            this._observable = new Rx.Subject();

            this._getReactiveTransport().then(function (reactiveTransport) {
                reactiveTransport.getObservable().subscribe(this._observable);
            }.bind(this));
        }

        return this._observable;
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
