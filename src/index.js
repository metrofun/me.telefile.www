window.Promise = require('es6-promise').Promise;

var PeerConnection = require('./PeerConnection.js');


document.getElementById('create-button').onclick = function () {
    console.log('created');

    var connection = new PeerConnection('zzz');

    connection.getDataChannel().then(function () {
        console.log(arguments);
    });

};
document.getElementById('join-form').onclick = function () {
    console.log(document.getElementById('room-input').value);
    return false;
};
