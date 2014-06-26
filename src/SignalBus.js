function SignalBus(busNumber) {
    this.busNumber = busNumber;

}
SignalBus.prototype.connect = function () {
    var promise = new Promise();

    this.sock = new SockJS( 'ws://127.0.0.1:1111/v1/room/' + (this.busNumber || ''));

    sock.onopen = function() {
        sock.resolve(this.sock);
    };
    sock.onclose = function() {
        sock.reject(this.sock);
    };

    return promise;
};
SignalBus.prototype.disconnect = function () {
    throw new Error('Not Implemented');
};

module.exports = SignalBus;
