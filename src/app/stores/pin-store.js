var Store = require('./store-class.js');

function isPinValid(pin) {
    return /^[a-zA-Z0-9]{8}$/.test(pin);
}

module.exports = new Store({
    pin: '',
    pinIsValid: false
}, function (data) {
    if (!data.hasOwnProperty('pinIsValid') && data.hasOwnProperty('pin')) {
        data.pinIsValid = isPinValid(data.pin);
    }
    return data;
});
