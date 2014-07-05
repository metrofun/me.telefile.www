window.Promise = require('es6-promise').Promise;

var FileTransmitter = require('./FileTransmitter.js'),
    FileReceiver = require('./FileReceiver.js');

document.getElementById('join-button').onclick = function () {
    var fileReceiver = new FileReceiver(document.getElementById('room-input').value);

    fileReceiver.get();
};

document.getElementById('file-select').addEventListener('change', function (e) {
    var file = e.target.files[0],
        fileTransmitter = new FileTransmitter(file);

    fileTransmitter.send();
}, false);
