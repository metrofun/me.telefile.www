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
DataChannel.prototype.connect = function () {

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
};
DataChannel.prototype.disconnect = function () {
    delete this._dataChannelPromise;

    this._pc.close();
};

DataChannel.prototype._enableSignaling = function () {
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
};
DataChannel.prototype._enableDataChannel = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        var dataChannel, handlers = {
                onopen: function () {
                    resolve(this);
                },
                onmessage: function (message) {
                    self.getObservable().onNext(message.data);
                },
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
                ordered: false
            });
            _.extend(dataChannel, handlers);
        } else {
            this._pc.ondatachannel = function (e) {
                _.extend(e.channel, handlers);
            };
        }
    }.bind(this)).catch(function (e) {
        setTimeout(function () {throw e; });
    });
};
DataChannel.prototype.SEND_RETRY = 20; //ms
DataChannel.prototype.send = function (plane, payload) {
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
};
DataChannel.prototype.getObserver = function () {
    var proxySubject, observable;

    if (!this._observerSubject) {
        proxySubject = new Rx.Subject();
        observable = proxySubject
            .concatMap(this.sendData.bind(this))
            .finally(this.disconnect.bind(this));

        this._observerSubject = Rx.Subject.create(proxySubject, observable);
    }

    return this._observerSubject;
};
DataChannel.prototype.getObservable = function () {
    if (!this._observable) {
        this._observable = new Rx.Subject();
    }

    return this._observable;
};
DataChannel.prototype._onLocalSdp = function (sdp) {
    this._pc.setLocalDescription(sdp);
    this._signalBus.emit('sdp', sdp);
};
DataChannel.prototype._mediaConstraints = {
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    }
};
module.exports = DataChannel;
