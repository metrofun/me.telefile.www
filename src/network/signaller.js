var SockJS,
    config = require('../env/current.js'),
    ReactiveTransport = require('./reactive-transport.js');

try {
    SockJS = require('sockjs-client');
} catch (e) {
    console.error(e);
}

if (typeof window !== 'undefined') {
    window.SockJS = SockJS;
}
/**
 * Creates a reactive transport  for signalling,
 * over a websocket connection.
 * If pin is present joins existing signalling room.
 * Otherwice creates a new one.
 *
 * @constructor
 *
 * @param {String|Number} [pin]
 */
function Signaller(pin) {
    this._sock = new SockJS(config.SIGNAL_SERVER + '/v1/room/' + (pin || 'create'));
    this._reactiveTransport = new ReactiveTransport(this._sock);
    this._initPin();
}

Signaller.prototype = {
    constructor: Signaller,

    /**
     * Returns current session pin
     *
     * @returns {Promise}
     */
    getPin: function () {
        return this._pinPromise;
    },
    getReadStream: function () {
        return this._reactiveTransport.getReadStream().skip(1);
    },
    getWriteBus: function () {
        return this._reactiveTransport.getWriteBus();
    },
    _initPin: function() {
        var self = this;

        this._pinPromise = new Promise(function (resolve, reject) {
            self._reactiveTransport.getReadStream().take(1).subscribe(function (message) {
                resolve(message.pin);
            }, function (e) {
                reject(e);
            });
        });
    }
};

module.exports = Signaller;
