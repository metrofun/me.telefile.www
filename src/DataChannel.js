var SignalBus = require('./SignalBus.js'),
    PeerMessage = require('./PeerMessage.js'),
    Rx = require('rx'),
    _ = require('underscore');

function DataChannel(channelId) {
    this._channelId = channelId;
    this._isCaller = !!channelId;
    this._pc = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    });
    this._enableSignaling();
}
DataChannel.prototype = {
    SEND_RETRY: 20, //ms
    DATA_PLANE: 1,
    CONTROL_PLANE: 1 << 1,
    NORMAL_TERMINATION: 'NORMAL_TERMINATION',
    ERROR_TERMINATION: 'ERROR_TERMINATION',

    connect: function () {

        if (!this._dataChannelPromise) {
            //NOTE a data channel should be created before an offer,
            //otherwise doesn't work
            this._dataChannelPromise = this._enableDataChannel();

            this._signalBus.connect();

            if (this._isCaller) {
                this._pc.createOffer(this._onLocalSdp.bind(this), null, this._mediaConstraints);
            }
        }
        return this._dataChannelPromise;
    },
    onLocalError: function () {
    },
    onRemoteError: function () {
    },
    disconnect: function () {
        delete this._dataChannelPromise;

        this._pc.close();
    },
    _enableSignaling: function () {
        var self = this;

        this._signalBus = new SignalBus(this._channelId);

        this._signalBus.once('sdp', function (sdp) {
            self._pc.setRemoteDescription(new RTCSessionDescription(sdp));

            if (!self._isCaller) {
                self._pc.createAnswer(
                    self._onLocalSdp.bind(self),
                    null,
                    this._mediaConstraints
                );
            }
        });
        this._signalBus.on('candidate', function (candidate) {
            self._pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        this._pc.onicecandidate = function (e) {
            if (e.candidate) {
                self._signalBus.emit('candidate', e.candidate);
            }
        };
        this._pc.oniceconnectionstatechange = function () {
            // if (self._pc.iceConnectionState === 'disconnected') {
                // TODO unify closes
                // }
        };
    },
    _enableDataChannel: function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            var dataChannel, handlers = {
                onopen: function () {
                    console.log('onopen');
                    resolve(this);
                },
                onmessage: self._onDataChannelMessage.bind(self),
                onerror: function (error) {
                    self.getObservable().onError(error);
                    console.log('error', arguments);
                    reject(this);
                },
                onclose: function () {
                    self.getObservable().onCompleted();
                }
            };

            if (this._isCaller) {
                dataChannel = this._pc.createDataChannel('default', {
                    ordered: true
                });
                _.extend(dataChannel, handlers);
            } else {
                this._pc.ondatachannel = function (e) {
                    console.log('ondatachannel');
                    _.extend(e.channel, handlers);
                };
            }
        }.bind(this)).catch(function (e) {
            setTimeout(function () {throw e; });
        });
    },
    _onDataChannelMessage: function (e) {
        var message = PeerMessage.decode(e.data);

        if (message.plane === this.CONTROL_PLANE) {
            // if (message.payload === this.NORMAL_TERMINATION) {
            this.getObservable().onCompleted();
            // }
        } else if (message.plane === this.DATA_PLANE) {
            this.getObservable().onNext(message.payload);
        }
    },
    _send: function (plane, payload) {
        var self = this;

        return this.connect().then(function (dataChannel) {
            if (dataChannel.bufferedAmount === 0) {
                dataChannel.send(PeerMessage.encode(plane, payload));

                return Promise.resolve(payload);
            } else {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(self.sendData(plane, payload));
                    }, self.SEND_RETRY);
                }).catch(function (e) {
                    setTimeout(function () {
                        throw e;
                    });
                });
            }
        });
    },
    sendData: function (data) {
        return this._send(this.DATA_PLANE, data);
    },
    getObserver: function () {
        var self, proxySubject, observable;

        if (!this._observerSubject) {
            self = this;
            proxySubject = new Rx.Subject();
            observable = proxySubject.concatMap(this.sendData.bind(this)).share();

            observable.subscribe(undefined, function (e) {
                setTimeout(function () {
                    throw e;
                });
                self._send(self.CONTROL_PLANE, self.ERROR_TERMINATION);
            }, function () {
                self._send(self.CONTROL_PLANE, self.NORMAL_TERMINATION);
            });

            this._observerSubject = Rx.Subject.create(proxySubject, observable);
        }

        return this._observerSubject;
    },
    getObservable: function () {
        if (!this._observable) {
            this._observable = new Rx.Subject();
        }

        return this._observable;
    },
    _onLocalSdp: function (sdp) {
        this._pc.setLocalDescription(sdp);
        this._signalBus.emit('sdp', sdp);
    },
    _mediaConstraints: {
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }
};
module.exports = DataChannel;
