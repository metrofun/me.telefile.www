var Rx = require('rx'),
    Webrtc = require('../network/webrtc.js'),

    FILE_SENDER_DISPOSED = 'File sender disposed';

function FileTransfer(pin) {
    this._webrtc = new Webrtc(pin);

    this._metaStream = this.getFileStream().first().shareReplay(1);
    this._initSentSizeStream();
    this._initProgressStream();
    this._initBpsStream();
}
FileTransfer.prototype = {
    getFileStream: function () {
        throw new Error('not implemented');
    },
    getBlob: function () {
        throw new Error('not implemented');
    },
    getPin: function () {
        return this._webrtc.getPin();
    },
    getTransport: function () {
        return this._webrtc;
    },
    getMeta: function () {
        return this._metaStream.toPromise();
    },
    getProgress: function () {
        return this._progressStream;
    },
    getBps: function () {
        return this._bpsStream;
    },
    dispose: function () {
        this._webrtc.getWriteBus().onError(new Error(FILE_SENDER_DISPOSED));
    },
    _initSentSizeStream: function () {
        // First frame always contains a meta information
        this._sentSizeStream = this.getFileStream().skip(1).scan(0, function (sum, data) {
            return sum + data.byteLength;
        }).sample(500/* ms */).shareReplay(1);
    },
    _initProgressStream: function () {
        this._progressStream  = this._sentSizeStream.combineLatest(this._metaStream, function (size, meta) {
            return size / meta.size * 100;
        }).shareReplay(1);
    },
    _initBpsStream: function () {
        this._bpsStream = Rx.Observable.combineLatest(
            this._metaStream.map(function () {return Date.now();}),
            this._sentSizeStream,
            function (startTime, sum) {
                return sum / (Date.now() - startTime) * 1000;
            }
        ).shareReplay(1);
    }
};

module.exports = FileTransfer;
