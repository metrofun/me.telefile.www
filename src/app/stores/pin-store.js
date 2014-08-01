var Rx = require('rx'),
    dispatcher = require('../dispatcher.js'),
    ReactiveStore = require('./reactive-store-class'),
    actions =  require('../actions/actions.js');

function isValid(pin) {
    return /^[a-zA-Z0-9]{8}$/.test(pin);
}

function PinStore() {
    this.subject = new Rx.Subject();

    ReactiveStore.call(this, this.subject, {
        pin: '',
        pinIsValid: true
    });

    // PIN_CHANGED
    dispatcher.filter(function (e) {
        return e.action === actions.PIN_CHANGED;
    }).pluck('pin').map(function (pin) {
        return {
            pin: pin,
            pinIsValid: isValid(pin)
        };
    }).subscribe(this.subject);
}
PinStore.prototype = Object.create(ReactiveStore.prototype, {
    constructor: {value: PinStore}
});

module.exports = new PinStore();
