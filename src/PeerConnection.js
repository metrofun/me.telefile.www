var SignalBus = require('./SignalBus.js');

function PeerConnection(channelId) {
    var self = this;

    this._signalBus = new SignalBus(channelId);
    this._isCaller = !!channelId;
    this._peerConnection = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    }, {optional: [{ RtpDataChannels: true }]});

    this._ensureDataChannelEnabled();

    this._onLocalSdp = this._onLocalSdp.bind(this);

    if (this._isCaller) {
        this._peerConnection.createOffer(this._onLocalSdp);
        this._peerConnection.ondatachannel = function () {
            console.log('ondatachannel');
        };
    }

    //subscribe to local and remote events
    this._signalBus.once('sdp', function (sdp) {
        console.log('setRemoteDescription', self._peerConnection);
        self._peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

        if (!self._isCaller) {
            self._peerConnection.createAnswer(self._onLocalSdp);
        }

        this.on('candidate', function (candidate) {
            self._peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
    });
    this._peerConnection.onicecandidate = function (e) {
        if (e.candidate) {
            self._signalBus.emit('candidate', e.candidate);
        }
    };
}
PeerConnection.prototype._ensureDataChannelEnabled = function () {
    this.getDataChannel();
};
PeerConnection.prototype.getDataChannel = function () {
    if (!this._dataChannelPromise) {
        this._dataChannelPromise = new Promise(function (resolve, reject) {
            var dataChannel = this._peerConnection.createDataChannel('default', {
                reliable: true,
                ordered: false,
            });

            dataChannel.onopen = function () {
                console.log('onopen');
                resolve(dataChannel);
            };
            dataChannel.onerror = dataChannel.onclose = function () {
                console.log(arguments);
                reject(dataChannel);
            };
        }.bind(this));
    }
    return this._dataChannelPromise;
};
PeerConnection.prototype._onLocalSdp = function (sdp) {
    this._peerConnection.setLocalDescription(sdp);
    this._signalBus.emit('sdp', sdp);
};
PeerConnection.prototype._mediaConstraints = {
    OfferToReceiveAudio: 0,
    OfferToReceiveVideo: 0
};
module.exports = PeerConnection;
