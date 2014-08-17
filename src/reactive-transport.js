var Rx = require('rx'),
    RSVP = require('rsvp'),
    TransportFrame = require('./reactive-transport-frame.js'),

    DATA_PLANE = 1,
    CONTROL_PLANE = 1 << 1,
    NORMAL_TERMINATION = 'NORMAL_TERMINATION',
    ERROR_TERMINATION = 'ERROR_TERMINATION';

function ReactiveTransport(transport) {
    this._transport = transport;
}

ReactiveTransport.prototype = {
    constructor: ReactiveTransport,

    getObservable: function () {
        var self;

        if (!this._observableSubject) {
            self = this;
            this._observableSubject = new Rx.Subject();

            //fix for firefox
            this._transport.binaryType = 'arraybuffer';

            this._transport.onmessage = function (e) {
                var message = TransportFrame.decode(e.data);

                if (message.plane === CONTROL_PLANE) {
                    if (message.payload === NORMAL_TERMINATION) {
                        console.log('onCompleted');
                        self._observableSubject.onCompleted();
                        self.terminate();
                    } else if (message.payload === ERROR_TERMINATION) {
                        self._observableSubject.onError(ERROR_TERMINATION);
                        self.terminate();
                    }
                } else if (message.plane === DATA_PLANE) {
                    self._observableSubject.onNext(message.payload);
                }
            };
            this._transport.onclose = this._transport.onerror = function (e) {
                console.error(e);
                // todo
                self._observableSubject.onError(ERROR_TERMINATION);
            };
        }

        return this._observableSubject;
    },
    getObserver: function () {
        var self, observer, observable, controller;

        if (!this._observerSubject) {
            self = this;
            observer = new Rx.Subject();
            controller = new Rx.Subject();
            observable = new Rx.Subject();

            observer.pausableBuffered(controller).shareValue('fixme').subscribe(observable);

            // workaround for pausableBuffered, that swallows first item
            observer.onNext('fixme');

            observable.subscribe(function (payload) {
                try {
                    self._transport.send(TransportFrame.encode(DATA_PLANE, payload));
                } catch (e) {
                    observer.onError(e);
                }
            }, function (e) {
                console.error(e);
                self.terminate(ERROR_TERMINATION);
            }, function () {
                console.log('NORMAL_TERMINATION');
                self.terminate(NORMAL_TERMINATION);
            });

            Rx.Observable.fromPromise(this._readyStateIsOpen()).subscribe(controller);

            this._observerSubject = Rx.Subject.create(observer, observable);
        }

        return this._observerSubject;
    },
    terminate: function (reason) {
        if (this._transport) {
            if (reason) {
                try {
                    this._transport.send(TransportFrame.encode(CONTROL_PLANE, reason));
                } catch (e) {
                    console.error(e);
                }
            }
            this._transport.onclose = this._transport.onerror = null;
            this._transport.close();
        }
    },
    _readyStateIsOpen: function () {
        return new RSVP.Promise(function (resolve) {
            //handles WebSocket and WebRTC
            if (this._transport.readyState === 1 || this._transport.readyState === 'open') {
                resolve(true);
            } else {
                this._transport.onopen = function () {
                    resolve(true);
                };
            }
        }.bind(this));
    }
};

module.exports = ReactiveTransport;
