var Rx = require('rx'),
    _ = require('underscore');

function isDifferent(currentState, state) {
    return _.isEqual(currentState, state);
}

function ReactiveStore(observable, state) {
    var self = this;

    this._state = state || {};

    Rx.Observable.call(this, function (observer) {
        observable.distinctUntilChanged(null, isDifferent).do(function (state) {
            self._state = state;
        }).subscribe(observer);
    });
}
ReactiveStore.prototype = Object.create(Rx.Observable.prototype, {
    constructor: {value: ReactiveStore},
    get: {value: function () {
        return this._state;
    }}
});

module.exports = ReactiveStore;
