var ReactiveSignaller = require('./reactive-signaller.js'),
    ReactiveTransport = require('./reactive-transport.js'),
    Rx = require('rx'),
    RSVP = require('rsvp'),

    RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
    RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate,
    RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

function ReactiveWebrtc(channelId) {
    this._channelId = channelId;
    this._isCaller = !!channelId;
    this._pc = new RTCPeerConnection({
        iceServers: require('./ice-servers.js')
    });

    //request data channel before creating and offer
    this._getDataChannel();
    this._enableSignaller();

    if (this._isCaller) {
        this._pc.createOffer(this._onLocalSdp.bind(this), function (e) {
            console.error(e);
        }, this._mediaConstraints);
    }
}
ReactiveWebrtc.prototype = {
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

            subscription = observer.subscribe(function (data) {
                queue.push(data);
            });

            // TODO what of cancelled before datachannel acquired ?
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

        this._reactiveSignaller = new ReactiveSignaller(this._channelId);

        observable = this._reactiveSignaller.getObservable().catch(function (e) {
            console.log('ReactiveSignaller onError:', e);
            self.getObservable().onError(e);
            self.getObserver().onError(e);

            return Rx.Observable.empty();
        });

        observable.pluck('sdp').filter(Boolean).take(1).subscribe(function (sdp) {
            self._pc.setRemoteDescription(new RTCSessionDescription(sdp));

            if (!self._isCaller) {
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
