require('angular/angular');
require('./app.js');

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
