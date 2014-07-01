var SignalBus = require('./SignalBus.js'),
    _ = require('underscore'),
    util = require('util');

function PeerConnection(channelId) {
    var self = this;

    this._signalBus = new SignalBus(channelId);
    this._isCaller = !!channelId;
    this._peerConnection = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    }, {optional: [{ RtpDataChannels: true }]});

    //NOTE a data channel should be created before an offer,
    //otherwise doesn't work
    this._enableDataChannel().catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });

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
                reliable: true,
                ordered: false,
            });
            _.extend(dataChannel, handlers);
        } else {
            this._peerConnection.ondatachannel = function (e) {
                _.extend(e.channel, handlers);
            };
        }
    }.bind(this));

    return this._dataChannelPromise;
};
PeerConnection.prototype.getDataChannel = function () {
    return this._dataChannelPromise;
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
