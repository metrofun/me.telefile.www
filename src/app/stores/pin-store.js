var Store = require('./store-class.js');

function isPinValid() {
    return true;
}

module.exports = new Store({
    pin: '',
    pinIsValid: true
}, function (data) {
    if (!data.hasOwnProperty('pinIsValid') && data.hasOwnProperty('pin')) {
        data.isPinValid = isPinValid(data.pin);
    }
    return data;
});
