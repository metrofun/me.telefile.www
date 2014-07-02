var SignalBus = require('./SignalBus.js'),
    _ = require('underscore');

function PeerConnection(channelId) {
    console.log(channelId);
    var self = this;

    this._signalBus = new SignalBus(channelId);
    this._isCaller = !!channelId;
    this._peerConnection = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    }, {optional: [{ RtpDataChannels: true }]});

    //NOTE a data channel should be created before an offer,
    //otherwise doesn't work
    this._enableDataChannel();

    this._signalBus.once('sdp', function (sdp) {
        self._peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

        if (!self._isCaller) {
            self._peerConnection.createAnswer(
                self._onLocalSdp.bind(self),
                null,
                this._mediaConstraints
            );
        }

    });
    this._signalBus.on('candidate', function (candidate) {
        self._peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
    this._peerConnection.onicecandidate = function (e) {
        if (e.candidate) {
            self._signalBus.emit('candidate', e.candidate);
        }
    };

    if (this._isCaller) {
        this._peerConnection.createOffer(this._onLocalSdp.bind(this), null, this._mediaConstraints);
    }
}
PeerConnection.prototype._enableDataChannel = function () {
    this._dataChannelPromise = new Promise(function (resolve, reject) {
        var dataChannel, handlers = {
            onopen: function () {
                resolve(this);
            },
            onerror: function () {
                reject(this);
                console.log('error', arguments);
            }
        };

        if (this._isCaller) {
            dataChannel = this._peerConnection.createDataChannel('default', {
                ordered: false
            });
            _.extend(dataChannel, handlers);
        } else {
            this._peerConnection.ondatachannel = function (e) {
                _.extend(e.channel, handlers);
            };
        }
    }.bind(this)).catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });

    return this._dataChannelPromise;
};
PeerConnection.prototype.SEND_RETRY = 20; //ms
PeerConnection.prototype.sendData = function (data) {
    var self = this;

    return this._dataChannelPromise.then(function () {
        if (self._peerConnection.bufferedAmount === 0) {
            return Promise.resolve(data);
        } else {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(this.sendData(data));
                }, this.SEND_RETRY);
            }).catch(function (e) {
                setTimeout(function () {
                    throw e;
                });
            });
        }
    });
};
PeerConnection.prototype._onLocalSdp = function (sdp) {
    this._peerConnection.setLocalDescription(sdp);
    this._signalBus.emit('sdp', sdp);
};
PeerConnection.prototype._mediaConstraints = {
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    }
};
module.exports = PeerConnection;
