// require('angular/angular');
// require('./app.js');

var RSVP = require('rsvp');

RSVP.on('error', function (e) {
    throw e;
});

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
