var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),

    PIN_LENGTH = 4;

class Pin extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            var isValid, pin = action.pin;

            if (action.type === actions.PIN_CHANGED) {
                if (pin.length <= PIN_LENGTH) {
                    isValid = this.isValid_(action.pin);
                    this.setState({pin, isValid});

                    if (isValid) {
                        // Implicit dependency
                        require('./file.js');
                        dispatcher.onNext({ type: actions.PIN_VALID, pin});
                    }
                }
            } else if (action.type === actions.PIN_INVALID
                || action.type === actions.RESET) {
                this.setState({ isValid: false, pin: '' });
            }
        }, this);
    }
    getInitialState() {
        return {
            pin: '',
            isValid: false
        };
    }
    isValid_(pin) {
        // should be in sync with PIN_LENGTH
        return /^[a-zA-Z0-9]{4}$/.test(pin);
    }
}

module.exports = new Pin();
