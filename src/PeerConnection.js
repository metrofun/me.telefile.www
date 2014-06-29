var SignalBus = require('./SignalBus.js');

function PeerConnection(channelId) {
    var self = this;

    this._signalBus = new SignalBus(channelId);
    this._isCaller = !!channelId;
    this._peerConnection = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    }, {optional: [{ RtpDataChannels: true }]});

    this._onLocalSdp = this._onLocalSdp.bind(this);

    if (this._isCaller) {
        this._createDataChannel();
        this._peerConnection.createOffer(this._onLocalSdp);
    } else {
        this._peerConnection.ondatachannel = function (e) {
            console.log('ondatachannel', e);
        };
    }

    //subscribe to local and remote events
    this._signalBus.once('sdp', function (sdp) {
        console.log('setRemoteDescription', self._peerConnection);
        self._peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

        if (!self._isCaller) {
            self._peerConnection.createAnswer(self._onLocalSdp);
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
}
PeerConnection.prototype._ensureDataChannelEnabled = function () {
    this.getDataChannel().catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });
};
PeerConnection.prototype._createDataChannel = function () {
    var dataChannel = this._peerConnection.createDataChannel('default', {
        reliable: true,
        ordered: false,
    });
    console.log(dataChannel);

    dataChannel.onopen = function () {
        console.log('onopen');
    };
    dataChannel.onerror = dataChannel.onclose = function () {
        console.log('error', arguments);
    };

    return dataChannel;
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
