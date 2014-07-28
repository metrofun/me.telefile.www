var Rx = require('rx'),
    _ = require('underscore');

function Store(initial, through) {
    var observer = new Rx.Subject();

    return _.extend(Object.create(Rx.Subject.create(
        observer,
        observer.map(through).map(function (newStore) {
            return _.extend({}, this, newStore);
        }, this).distinctUntilChanged(null, function (currentStore, store) {
            return _.isEqual(currentStore, store);
        }).do(function (store) {
            _.extend(this, store);
        })
    )), initial);
}

module.exports = Store;
