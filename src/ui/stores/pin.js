var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),

    PIN_LENGTH = 6;

class Pin extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            var isValid, pin = action.pin;

            if (action.type === actions.PIN_CHANGED) {
                if (pin.length <= PIN_LENGTH) {
                    isValid = this.isValid_(action.pin);
                    this.setState({ pin, isValid });

                    if (isValid) {
                        dispatcher.onNext({ type: actions.PIN_VALID, pin});
                    }
                }
            } else if (action.type === actions.PIN_INVALID) {
                this.setState({ isValid: false });
            }
        }, this);
    }
    getDefaultState() {
        return {
            pin: '',
            isValid: false
        };
    }
    isValid_(pin) {
        // should be in sync with PIN_LENGTH
        return /^[a-zA-Z0-9]{6}$/.test(pin);
    }
}

module.exports = new Pin();
