var Rx = require('rx'),
    TransportFrame = require('./reactive-transport-frame.js'),

    DATA_PLANE = 1,
    CONTROL_PLANE = 1 << 1,

    OPEN_ERROR_LABEL ='transport connection could not opened',
    UNEXPECTED_CLOSE_LABEL = 'connection unexpectedly closed',

    NORMAL_TERMINATION = 'NORMAL_TERMINATION',
    ERROR_TERMINATION = 'ERROR_TERMINATION';

/**
 * Reactive abstraction about transport layer.
 * Supports RTCDataChannel and websocket transports.
 *
 * @constructor
 *
 * @param {RTCDataChannel|WebSocket} transport
 */
function ReactiveTransport(transport) {
    this._transport = transport;

    this._configureTransport();
}

ReactiveTransport.prototype = {
    constructor: ReactiveTransport,

    getReadStream: function () {
        var self;

        if (!this._readStreamSubject) {
            self = this;

            this._readStreamSubject = new Rx.Subject();

            this._transport.onmessage = function (e) {
                var message = TransportFrame.decode(e.data);

                if (message.plane === CONTROL_PLANE) {
                    if (message.payload === NORMAL_TERMINATION) {
                        self._readStreamSubject.onCompleted();
                        self._closeTransport();
                    } else if (message.payload === ERROR_TERMINATION) {
                        self._readStreamSubject.onError(new Error(self._transport + ': received an error from a remote peer'));
                        self._closeTransport();
                    }
                } else if (message.plane === DATA_PLANE) {
                    self._readStreamSubject.onNext(message.payload);
                }
            };
        }
        return this._readStreamSubject;
    },
    /**
     * In order to send something by transport,
     * you have to write to this duplex stream.
     * In order to be notified what messages were sent or errored
     * you should subscribe to events from this duplex stream
     *
     * @returns {Rx.Subject}
     */
    getWriteBus: function () {
        var inSubject, outSubject, self;

        if (!this._sendingSubject) {
            self = this;

            inSubject = new Rx.Subject();
            outSubject = new Rx.Subject();
            inSubject.pausableBuffered(this._getOpenStatePauser()).subscribe(function (payload) {
                try {
                    self._transport.send(TransportFrame.encode(DATA_PLANE, payload));
                    outSubject.onNext(payload);
                } catch (e) {
                    outSubject.onError(e);
                }
            }, function (incomingError) {
                try {
                    self._terminate(ERROR_TERMINATION);
                    outSubject.onError(incomingError);
                } catch (e) {
                    outSubject.onError(e);
                }
            }, function () {
                try {
                    self._terminate(NORMAL_TERMINATION);
                    outSubject.onCompleted();
                } catch (e) {
                    outSubject.onError(e);
                }
            });

            this._observerSubject = Rx.Subject.create(inSubject, outSubject);
        }

        return this._observerSubject;
    },
    _configureTransport: function () {
        var self = this;
        // fix for firefox
        this._transport.binaryType = 'arraybuffer';

        // because we can have only one callback for each event,
        // we have to put logic fot both getReadStream and getWriteBus in advance
        this._transport.onopen = function () {
            if (self._openStatePauser) {
                self._openStatePauser.onNext(true);
            }
        };
        this._transport.onclose = function () {
            if (self._readStreamSubject) {
                self._readStreamSubject.onError(new Error(UNEXPECTED_CLOSE_LABEL + ' : ' + this.transport));
            }
            if (self._openStatePauser) {
                self._openStatePauser.onError(new Error(OPEN_ERROR_LABEL));
            }
        };
        this._transport.onerror = function (e) {
            if (self._readStreamSubject) {
                self._readStreamSubject.onError(e);
            }
            if (self._openStatePauser) {
                self._openStatePauser.onError(new Error(OPEN_ERROR_LABEL));
            }
        };
    },
    /**
     * @param {String} [reason] If present, will be sent by transport
     */
    _terminate: function (reason) {
        this._transport.send(TransportFrame.encode(CONTROL_PLANE, reason));
        this._closeTransport();
    },
    _closeTransport: function () {
        this._transport.onclose = this._transport.onerror = null;
        try {
            this._transport.close();
        } catch (e) {}
    },
    /**
     * Resolves, when transport is open
     *
     * @returns {Rx.Observable}
     */
    _getOpenStatePauser: function () {
        var self;

        if (!this._openStatePauser) {
            self = this;
            this._openStatePauser = new Rx.Subject();

            var readyState = this._transport.readyState,
            rejectLabel = 'transport connection could not opened';

            // WebSocket and RTCDataChannel different readyState values
            if (readyState === 1 || readyState === 'open') {
                this._openStatePauser.onNext(true);
            } else if (readyState === 3 || readyState === 'closed') {
                this._openStatePauser.onError(new Error(rejectLabel));
            }
        }

        return this._openStatePauser;
    }
};

module.exports = ReactiveTransport;
