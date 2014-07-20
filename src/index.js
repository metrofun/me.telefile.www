require('angular/angular');
require('./app.js');

var SignalBus = require('./SignalBus.js'),
    RSVP = require('rsvp');

RSVP.on('error', function (e) {
    throw e;
});

(new SignalBus()).getStream().then(function (stream) {
    stream.duplex.subscribe(function () {
        console.log(arguments);
    });
});

return;
var FileTransmitter = require('./FileTransmitter.js');
    // FileReceiver = require('./FileReceiver.js');

// document.getElementById('join-button').onclick = function () {
    // var fileReceiver = new FileReceiver(document.getElementById('room-input').value);

    // fileReceiver.get();
// };

document.getElementById('file-select').addEventListener('change', function (e) {
    var file = e.target.files[0],
        fileTransmitter = new FileTransmitter(file);

    fileTransmitter.send();
}, false);
