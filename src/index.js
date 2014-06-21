/*global webkitRTCPeerConnection */
console.log({
    iceServers: require('./iceServers.js')
});
var
peerConnection = new webkitRTCPeerConnection({
    iceServers: require('./iceServers.js')
}),
dataChannel = peerConnection.createDataChannel('default', {
    reliable: true,
    ordered: false
}),
mediaConstraints = {
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    }
};

peerConnection.createOffer(function (offer) {
    peerConnection.setLocalDescription(offer);
}, null, mediaConstraints);

peerConnection.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
};
