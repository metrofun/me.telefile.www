/*global webkitRTCPeerConnection */
var SignalBus = require('./SignalBus.js');
var
peerConnection = new webkitRTCPeerConnection({
    iceServers: require('./iceServers.js')
}),
dataChannel = peerConnection.createDataChannel('default', {
    reliable: true,
    ordered: false
}),
mediaConstraints = {mandatory: {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
}};

peerConnection.createOffer(function (offer) {
    peerConnection.setLocalDescription(offer);
}, null, mediaConstraints);

peerConnection.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
};

function DataChannel(channelID) {
    this._signalBus = new SignalBus(channelID);
    this._peerConnection = new webkitRTCPeerConnection({
        iceServers: require('./iceServers.js')
    });

    // we want only to receive
    if (channelID) {
    } else {
        // we want only to transmit
    }
}
DataChannel.prototype.send = function (data) {
};
module.exports = DataChannel;
