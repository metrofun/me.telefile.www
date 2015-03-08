var Store = require('./store.js');

class Pin extends Store {
    getDefaultState() {
        return {
            pin: '',
            isValid: false
        };
    }
}

module.exports = new Pin();
