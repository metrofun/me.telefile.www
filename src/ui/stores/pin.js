var Rx = require('rx'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),
    Store = require('./store.js');

class Pin extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.PIN_CHANGED) {
                this.setState({
                    pin: action.pin,
                    isValid: this.isValid_(action.pin)
                });
            }
        }, this);
    }
    isValid_(pin) {
        return /^[a-zA-Z0-9]{6}$/.test(pin);
    }
    getDefaultState() {
        return {
            pin: '',
            isValid: true
        };
    }
}

module.exports = new Pin();
