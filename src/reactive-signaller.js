var SockJS = require('sockjs-client/lib/sockjs.js'),
    ReactiveTransport = require('./reactive-transport.js');

window.SockJS = SockJS;

function ReactiveSignaller(id) {
    var self = this, sock;

    sock = new SockJS('http://127.0.0.1:1111/v1/room/' + (id || 'create'));
    this._reactiveTransport = new ReactiveTransport(sock);

    if (id) {
        this.id = id;
    } else {
        this._reactiveTransport.getObservable()
            .pluck('meta').filter(Boolean).take(1)
            .subscribe(function (message) {
                console.log(message);
                self.id = message.id;
            });
    }
}

ReactiveSignaller.prototype.getObservable = function () {
    return this._reactiveTransport.getObservable();
};

ReactiveSignaller.prototype.getObserver = function () {
    return this._reactiveTransport.getObserver();
};

module.exports = ReactiveSignaller;
