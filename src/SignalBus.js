var SockJS = require('sockjs-client/lib/sockjs.js'),
    RSVP = require('rsvp'),
    DataStreamDuplex = require('./data-stream-duplex.js'),

    META_TYPE = 'meta';

window.SockJS = SockJS;

function SignalBus(id) {
    var self = this;

    if (id) {
        this.id = id;
    } else {
        this.getStream().then(function (stream) {
            stream.duplex.filter(function (message) {
                console.log(message);
                return message.type === META_TYPE;
            }).take(1).subscribe(function (message) {
                self.id = message.id;
            });
        });
    }
}

SignalBus.prototype.getStream = function () {
    if (!this._streamPromise) {
        this._streamPromise = this._getSock().then(function (sock) {
            var dataStream = new DataStreamDuplex(sock);
            return {duplex: dataStream};
        });
    }
    return this._streamPromise;
};

SignalBus.prototype._getSock = function () {
    if (!this._sockPromise) {
        this._sockPromise = new RSVP.Promise(function (resolve, reject) {
            var sock = new SockJS('http://127.0.0.1:1111/v1/room/' + (this.id || 'create'));
            sock.onopen = resolve.bind(this, sock);
            sock.onclose = reject;
        });
    }
    return this._sockPromise;
};

module.exports = SignalBus;
