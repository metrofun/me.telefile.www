window.Promise = require('es6-promise').Promise;

var PeerConnection = require('./PeerConnection.js');


document.getElementById('create-button').onclick = function () {
    var connection = new PeerConnection();
};
document.getElementById('join-button').onclick = function () {
    var connection = new PeerConnection(document.getElementById('room-input').value);
};
