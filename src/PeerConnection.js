function PeerConnection(channelId) {
    var self = this;

    this._signalBus = new SignalBus(channelId);
    this._isCaller = !!channelId;
    this._peerConnection = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    });
    this._onLocalSdp = this._onLocalSdp.bind(this);

    if (this._isCaller) {
        this._peerConnection.createOffer(this._onLocalSdp, null, this._mediaConstraints);
    }

    //subscribe to local and remote events
    this._signalBus.once('sdp', function (sdp) {
        this._peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

        if (!self._isCaller) {
            self._peerConnection.createAnswer(this._onLocalSdp, null, this._mediaConstraints);
        }
    });
    this._signalBus.on('candidate', function (candidate) {
        this._peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
    this._peerConnection.onicecandidate = function (e) {
        self._signalBus.emit('candidate', e.candidate);
    };
}
PeerConnection.prototype.getDataChannel = function () {
    var dataChannel, self = this;
    if (!this._dataChannelPromise) {
        this._dataChannelPromise = new Promise();

        dataChannel = this._peerConnection.createDataChannel('default', {
            reliable: true,
            ordered: false,
        });

        dataChannel.onopen = function () {
            self._dataChannelPromise.resolve(dataChannel);
        };
        dataChannel.onerror = dataChannel.onclose = function (e) {
            self._dataChannelPromise.reject(dataChannel);
        };
    }
    return this._dataChannelPromise;
};
PeerConnection.prototype._onLocalSdp = function (sdp) {
    this._peerConnection.setLocalDescription(sdp);
    this._signalBus.emit('sdp', sdp);
};
PeerConnection.prototype._mediaConstraints = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};
module.exports = PeerConnection;
