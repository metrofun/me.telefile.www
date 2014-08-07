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
    getPin: function () {
        return this._reactiveSignaller.getPin();
    },
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
                    self._mediaConstraints
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
        var observer, observable, controller,  queue, subscription;

        if (!this._observerSubject) {
            observer = new Rx.Subject();
            controller = new Rx.Subject();
            observable = new Rx.Subject();
            queue = [];

            subscription = observer.subscribe(function (data) {
                queue.push(data);
            });

            this._getDataChannel().then(function (dataChannel) {
                var reactiveTransport = new ReactiveTransport(dataChannel),
                    transportObserver = reactiveTransport.getObserver();

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
    _deferTillBufferEmpty: function (dataChannel) {
        return function (data) {
            return Rx.Observable.timer(0, 200).map(function () {
                return dataChannel.bufferedAmount > 0;
            }).takeWhile(function (bufferedAmount) {
                return bufferedAmount > 0;
            }).concat(Rx.Observable.return('nonempy')).toPromise().then(function () {
                return data;
            });
        };
    },
    getObservable: function () {
        if (!this._observable) {
            this._observable = new Rx.Subject();

            this._getDataChannel().then(function (dataChannel) {
                var reactiveTransport = new ReactiveTransport(dataChannel);

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
