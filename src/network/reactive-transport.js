var Rx = require('rx'),
    Frame = require('./frame.js'),

    DATA_PLANE = 1,
    CONTROL_PLANE = 1 << 1,

    OPEN_ERROR_LABEL ='transport connection could not opened',
    // UNEXPECTED_CLOSE_LABEL = 'connection unexpectedly closed',

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

    this._initTransport();
    this._initReadStream();
    this._initWriteBus();
}

ReactiveTransport.prototype = {
    constructor: ReactiveTransport,

    getReadStream: function () {
        return this._readStream;
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
        return this._observerSubject;
    },

    getOpenPauser: function () {
        return this._openPauser;
    },

    _initReadStream: function () {
        var self = this,
            subject = new Rx.Subject();

        this._transport.onmessage = function (e) {
            var message = Frame.decode(e.data);

            if (message.plane === CONTROL_PLANE) {
                if (message.payload === NORMAL_TERMINATION) {
                    subject.onCompleted();
                    self._closeTransport();
                } else if (message.payload === ERROR_TERMINATION) {
                    subject.onError(new Error(self._transport + ': received an error from a remote peer'));
                    self._closeTransport();
                }
            } else if (message.plane === DATA_PLANE) {
                subject.onNext(message.payload);
            }
        };
        // Subscribe to errors from _openPauser
        this._openPauser.ignoreElements().subscribe(subject);

        this._readStream = subject;
    },
    _initWriteBus: function () {
        var self = this,
            inSubject = new Rx.Subject(),
            outSubject = new Rx.Subject();

        // we need to subscribe to errors earlier
        // then following pausableBuffered will flush its queue on an error
        this._openPauser.ignoreElements().subscribe(outSubject);

        inSubject
            // workaround for pausableBuffered
            // pausableBuffered flushes queue when source completes,
            // so we merge inSubject with a sequence
            // which completes when tranport opens
            .merge(this._openPauser.take(1).ignoreElements())
            .pausableBuffered(this._openPauser)
            .subscribe(function (payload) {
                try {
                    self._transport.send(Frame.encode(DATA_PLANE, payload));
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
    },
    _initTransport: function () {
        var self = this,
            readyState = this._transport.readyState;

        this._openPauser = new Rx.ReplaySubject(1);
        // fix for firefox
        this._transport.binaryType = 'arraybuffer';

        // WebSocket and RTCDataChannel different readyState values
        if (readyState === 1 || readyState === 'open') {
            this._openPauser.onNext(true);
        } else if (readyState === 3 || readyState === 'closed') {
            this._openPauser.onError(new Error(OPEN_ERROR_LABEL));
        }

        this._transport.onopen = function () {
            self._openPauser.onNext(true);
        };
        this._transport.onclose = function (e) {
            self._openPauser.onError(e);
                // new Error([
                    // UNEXPECTED_CLOSE_LABEL,
                    // Object.prototype.toString.call(self._transport)
                // ].join(' : '))
            // );
        };
        this._transport.onerror = function (e) {
            self._openPauser.onError(e);
        };
    },
    /**
     * @param {String} reason If present, will be sent by transport
     */
    _terminate: function (reason) {
        var self = this;
        this._transport.send(Frame.encode(CONTROL_PLANE, reason));
        // after sending a message don't close the transport immidiatly,
        // otherwise message will be not delivered.
        // so we wait till remote peer will close it,
        // or do it ourselfs after 1 second
        this._closeTransport(1000);
    },
    /**
     * @param {number} [timeout=0]
     */
    _closeTransport: function (timeout) {
        var self = this;
        this._transport.onclose = this._transport.onerror = null;
        setTimeout(function () {
            try {
                self._transport.close();
            } catch (e) {}
        }, timeout);
    }
};

module.exports = ReactiveTransport;
