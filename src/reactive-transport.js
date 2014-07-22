var Rx = require('rx'),
    TransportFrame = require('./reactive-transport-frame.js'),

    DATA_PLANE = 1,
    CONTROL_PLANE = 1 << 1,
    NORMAL_TERMINATION = 'NORMAL_TERMINATION',
    ERROR_TERMINATION = 'ERROR_TERMINATION';

function ReactiveTransport(transport) {
    this._transport = transport;
}

ReactiveTransport.prototype.getObservable = function () {
    var self;
    if (!this._observableSubject) {
        self = this;
        this._observableSubject = new Rx.Subject();

        this._transport.onmessage = function (e) {
            var message = TransportFrame.decode(e.data);

            if (message.plane === CONTROL_PLANE) {
                if (message.payload === NORMAL_TERMINATION) {
                    self._observableSubject.onCompleted();
                } else if (message.payload === ERROR_TERMINATION) {
                    self._observableSubject.onError(ERROR_TERMINATION);
                }
            } else if (message.plane === DATA_PLANE) {
                self._observableSubject.onNext(message.payload);
            }
        };
        this._transport.onclose = this._transport.onerror = function () {
            // todo
            self._observableSubject.onError(ERROR_TERMINATION);
            self._observableSubject.dispose();
        };
    }

    return this._observableSubject;
};
ReactiveTransport.prototype.getObserver = function () {
    var self, proxySubject, observable;

    if (!this._observerSubject) {
        self = this;
        proxySubject = new Rx.Subject();
        observable = proxySubject.pausableBuffered();

        observable.subscribe(function (payload) {
            console.log('send', payload);
            self._transport.send(TransportFrame.encode(DATA_PLANE, payload));
        }, function () {
            self._transport.send(TransportFrame.encode(CONTROL_PLANE, ERROR_TERMINATION));
        }, function () {
            self._transport.send(TransportFrame.encode(CONTROL_PLANE, NORMAL_TERMINATION));
        });

        //handles WebSocket and WebRTC
        if (this._transport.readyState === 1 || this._transport.readyState === 'open') {
            observable.resume();
        } else {
            this._transport.onopen = function () {
                observable.resume();
            }.bind(this);
        }

        // TODO remove workaround
        proxySubject.onNext('first message will be skipped by pausableBuffered');

        this._observerSubject = Rx.Subject.create(proxySubject, observable);
    }

    return this._observerSubject;
};

module.exports = ReactiveTransport;
