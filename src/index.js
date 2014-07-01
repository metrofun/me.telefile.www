window.Promise = require('es6-promise').Promise;

var PeerConnection = require('./PeerConnection.js');

document.getElementById('join-button').onclick = function () {
    var connection = new PeerConnection(document.getElementById('room-input').value);

    connection.getDataChannel().then(function (dataChannel) {
        console.log('receive', dataChannel);
        dataChannel.onmessage = function () {
            console.log(arguments);
        };
    }).catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });
};

document.getElementById('file-select').addEventListener('change', function (e) {
    var file = e.target.files[0],
        connection = new PeerConnection();

    connection.getDataChannel().then(function (dataChannel) {
        console.log('send', dataChannel);
        // dataChannel.send(new ArrayBuffer(32));
        dataChannel.send('12983njsknd');
    }).catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });
}, false);
