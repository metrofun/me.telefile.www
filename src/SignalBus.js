var EventEmitter = require('events').EventEmitter,
    SockJS = require('sockjs-client/lib/sockjs.js'),
    util = require('util');

window.SockJS = SockJS;

function SignalBus(busNumber) {
    this.busNumber = busNumber || 'create';

    this.connect().catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });
}
util.inherits(SignalBus, EventEmitter);

SignalBus.prototype.connect = function () {
    var self = this;

    if (!this._sockPromise) {
        this._sockPromise = new Promise(function (resolve, reject) {
            self._sock = new SockJS('http://127.0.0.1:1111/v1/room/' + self.busNumber || 'create');
            self._sock.onmessage = function (message) {
                self.busNumber = message.data;

                console.log('busNumber', self.busNumber);
                self._sock.onmessage = self._onMessage.bind(self);
            };

            self._sock.onopen = resolve;
            self._sock.onclose = reject;
        });
    }
    return this._sockPromise;
};
SignalBus.prototype.emit = function () {
    var args = Array.prototype.slice.apply(arguments);

    this.connect().then(function () {
        this._sock.send(JSON.stringify(args));
    }.bind(this)).catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });

};
SignalBus.prototype._onMessage = function (message) {
    EventEmitter.prototype.emit.apply(this, JSON.parse(message.data));
};
SignalBus.prototype.disconnect = function () {
    throw new Error('Not Implemented');
};

module.exports = SignalBus;
