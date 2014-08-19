var RSVP = require('rsvp'),
    ReactiveTransport = require('./reactive-transport.js');


function ReactiveSignaller(pin) {
    //lazy require, because of server rendering
    var SockJS = require('sockjs-client/lib/sockjs.js');
    window.SockJS = SockJS;

    this._sock = new SockJS('http://127.0.0.1:1111/v1/room/' + (pin || 'create'));
    this._reactiveTransport = new ReactiveTransport(this._sock);
    this._pinPromise = new RSVP.Promise(function (resolve, reject) {
        if (pin) {
            resolve(pin);
        } else {
            this._reactiveTransport.getObservable()
                .catch(function (e) {
                    console.log('catch', e);
                    reject(e);
                })
                .pluck('meta').filter(Boolean).take(1)
                .subscribe(function (message) {
                    resolve(message.id);
                }, function (e) {
                    console.log('subscribe', e);
                });
        }
    }.bind(this));
}

ReactiveSignaller.prototype = {
    constructor: ReactiveSignaller,

    terminate: function () {
        this._reactiveTransport.terminate();
        this._reactiveTransport = null;
    },
    getPin: function () {
        return this._pinPromise;
    },
    getObservable: function () {
        return this._reactiveTransport.getObservable();
    },
    getObserver: function () {
        return this._reactiveTransport.getObserver();
    }
};

module.exports = ReactiveSignaller;
