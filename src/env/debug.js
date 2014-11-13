var RSVP = require('rsvp'),
    Rx = require('rx');

RSVP.on('error', function (e) {
    console.error(e);
});

Rx.config.Promise = RSVP.Promise.bind(RSVP);

require('rx').Observable.prototype.log = function (ns) {
    ns = ns || '';
    return this.do(function (data) {
        console.log(ns + ' onNext', data);
    }, function (e) {
        // setTimeout(function () {
            // throw e;
        // });
        console.log(ns + ' onError', e);
    }, function () {
        console.log(ns + ' onCompleted');
    });
};
