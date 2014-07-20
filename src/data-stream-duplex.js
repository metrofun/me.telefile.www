var Rx = require('rx'),
    DataStreamFrame = require('./data-stream-frame.js'),

    DATA_PLANE = 1,
    CONTROL_PLANE = 1 << 1,
    NORMAL_TERMINATION = 'NORMAL_TERMINATION',
    ERROR_TERMINATION = 'ERROR_TERMINATION';

function createObservable(transport) {
    return Rx.Observable.create(function (observer) {
        transport.onmessage = function (e) {
            var message = DataStreamFrame.decode(e.data);

            if (message.plane === CONTROL_PLANE) {
                if (message.payload === NORMAL_TERMINATION) {
                    observer.onCompleted();
                } else if (message.payload === ERROR_TERMINATION) {
                    observer.onError(ERROR_TERMINATION);
                }
            } else if (message.plane === DATA_PLANE) {
                observer.onNext(message.payload);
            }

        };
        transport.onclose = function () {
            // todo
            observer.onError(ERROR_TERMINATION);
            observer.dispose();
        };
    });
}

function createObserver(transport) {
    var subject = new Rx.Subject();

    subject.subscribe(function (payload) {
        transport.send(DataStreamFrame.encode(DATA_PLANE, payload));
    }, function () {
        transport.send(DataStreamFrame.encode(CONTROL_PLANE, ERROR_TERMINATION));
    }, function () {
        transport.send(DataStreamFrame.encode(CONTROL_PLANE, NORMAL_TERMINATION));
    });

    return subject;
}

function subscribe(observer) {
    return this.observable.subscribe(observer);
}

function DataStream(transport) {
    Rx.Observable.call(this, subscribe);

    this.observable = createObservable(transport);
    this.observer = createObserver(transport);
}

DataStream.prototype = Object.create(Rx.Observable.prototype);
DataStream.prototype.constructor = DataStream;
DataStream.prototype.onCompleted = function () {
    this.observer.onCompleted();
};
DataStream.prototype.onError = function (exception) {
    this.observer.onError(exception);
};
DataStream.prototype.nNext = function (value) {
    this.observer.onNext(value);
};

module.exports = DataStream;
