var EventEmitter = require('events').EventEmitter,
    util = require('util');

function SignalBus(busNumber) {
    this.busNumber = busNumber;

    this.connect();
}
util.inherits(SignalBus, EventEmitter);

SignalBus.prototype.connect = function () {
    var promise = new Promise();

    this._sock = new SockJS( 'ws://127.0.0.1:1111/v1/room/' + (this.busNumber || ''));
    this._sock.onmessage = this._onMessage;

    _sock.onopen = function() {
        _sock.resolve(this);
    };
    _sock.onclose = function() {
        _sock.reject(this._sock);
    };

    return promise;
};
SignalBus.prototype.emit = function () {
    var args;

    return this.connect().then(function () {
        this._sock.send(JSON.stringify(args));
    }.bind(this));
};
SignalBus.prototype._onMessage = function (data) {
    this.emit.apply(this, JSON.parse(data));
};
SignalBus.prototype.disconnect = function () {
    throw new Error('Not Implemented');
};

module.exports = SignalBus;
