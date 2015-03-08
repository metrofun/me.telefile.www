var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),

    PIN_LENGTH = 6;

class Pin extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.PIN_CHANGED) {
                if (action.pin.length <= PIN_LENGTH) {
                    this.setState({
                        pin: action.pin,
                        isValid: this.isValid_(action.pin)
                    });
                }
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
