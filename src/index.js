// require('angular/angular');
// require('./app.js');

var RSVP = require('rsvp'),
    Rx = require('rx');

RSVP.on('error', function (e) {
    throw e;
});

Rx.config.Promise = RSVP.Promise.bind(RSVP);

require('Rx').Observable.prototype.log = function (ns) {
    this.subscribe(function (data) {
        console.log(ns + ' onNext', data);
    }, function (e) {
        setTimeout(function () {
            throw e;
        });
        console.log(ns + ' onError', e);
    }, function (data) {
        console.log(ns + ' onCompleted', data);
    });

    return this;
};

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
