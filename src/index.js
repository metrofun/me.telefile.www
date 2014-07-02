window.Promise = require('es6-promise').Promise;

var PeerConnection = require('./PeerConnection.js'),
    FileTransmitter = require('./FileTransmitter.js');

document.getElementById('join-button').onclick = function () {
    var connection = new PeerConnection(document.getElementById('room-input').value);

    // connection.getDataChannel().then(function (dataChannel) {
        // console.log('receive', dataChannel);
        // dataChannel.onmessage = function () {
            // console.log(arguments);
        // };
    // }).catch(function (e) {
        // setTimeout(function () {
            // throw e;
        // });
    // });
};

document.getElementById('file-select').addEventListener('change', function (e) {
    var file = e.target.files[0],
        fileTransmiteter = new FileTransmitter(file);
}, false);
