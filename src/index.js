window.Promise = require('es6-promise').Promise;

var PeerConnection = require('./PeerConnection.js');


document.getElementById('create-button').onclick = function () {
    var connection = new PeerConnection();

    connection.getDataChannel().then(function () {
        console.log('dataChannel', arguments);
    });
};
document.getElementById('join-button').onclick = function () {
    var connection = new PeerConnection(document.getElementById('room-input').value);

    connection.getDataChannel().then(function () {
        console.log('dataChannel', arguments);
    });
};
