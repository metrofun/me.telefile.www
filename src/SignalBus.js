var EventEmitter = require('events').EventEmitter,
    SockJS = require('sockjs-client/lib/sockjs.js'),
    util = require('util');

window.SockJS = SockJS;

function SignalBus(busNumber) {
    this.busNumber = busNumber || 'create';

    this.connect();
}
util.inherits(SignalBus, EventEmitter);

SignalBus.prototype.connect = function () {
    if (!this._sockPromise) {
        this._sockPromise = new Promise(function (resolve, reject) {
            this._sock = new SockJS('http://127.0.0.1:1111/v1/room/create/');
            this._sock.onmessage = this._onMessage;

            this._sock.onopen = resolve;
            this._sock.onclose = reject;
        }.bind(this));
    }
    return this._sockPromise;
};
SignalBus.prototype.emit = function () {
    var args = arguments;

    this.connect().then(function () {
        this._sock.send(JSON.stringify(args));
    }.bind(this)).catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });
};
SignalBus.prototype._onMessage = function (data) {
    this.emit.apply(this, JSON.parse(data));
};
SignalBus.prototype.disconnect = function () {
    throw new Error('Not Implemented');
};

module.exports = SignalBus;
