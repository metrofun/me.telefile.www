var Room = require('./room.js');

function RoomHub() {
    this._roomByPin = Object.create(null);
}

RoomHub.prototype = {
    PIN_LENGTH: 6,

    createRoom: function (transmitter) {
        var pin = this._getFreePin();

        this._roomByPin[pin] = new Room(transmitter);

        return pin;
    },
    joinRoom: function (pin, receiver) {
        var room = this._roomByPin[pin];

        if (room && !room.isFull()) {
            room.connect(receiver);
        } else {
            receiver.close(404);
        }
    },
    _getFreePin: function () {
        var pin;

        do {
            pin = this._generateHash();
        } while (this._roomByPin[pin]);

        return pin;
    },
    _generateHash: function () {
        return Array.apply(null, {length: this.PIN_LENGTH}).map(function () {
            return Math.floor(Math.random() * 10);
        }).join('');
    }
};

module.exports = new RoomHub();
