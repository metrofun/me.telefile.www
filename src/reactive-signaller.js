var SockJS = require('sockjs-client/lib/sockjs.js'),
    RSVP = require('rsvp'),
    ReactiveTransport = require('./reactive-transport.js');

window.SockJS = SockJS;

function ReactiveSignaller(pin) {
    var sock;

    sock = new SockJS('http://127.0.0.1:1111/v1/room/' + (pin || 'create'));
    this._reactiveTransport = new ReactiveTransport(sock);
    this._pinPromise = new RSVP.Promise(function (resolve) {
        if (pin) {
            resolve(pin);
        } else {
            this._reactiveTransport.getObservable()
                .pluck('meta').filter(Boolean).take(1)
                .subscribe(function (message) {
                    resolve(message.id);
                });
        }
    }.bind(this));
}

ReactiveSignaller.prototype.getPin = function () {
    return this._pinPromise;
};
ReactiveSignaller.prototype.getObservable = function () {
    return this._reactiveTransport.getObservable();
};

ReactiveSignaller.prototype.getObserver = function () {
    return this._reactiveTransport.getObserver();
};

module.exports = ReactiveSignaller;
