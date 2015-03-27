var Rx = require('rx'),
    Webrtc = require('../network/webrtc.js'),

    FILE_SENDER_DISPOSED = 'File sender disposed';

class FileTransfer {
    constructor(pin) {
        this._webrtc = new Webrtc(pin);

        this._metaStream = this.getFileStream().first().shareReplay(1);
        this._initSentSizeStream();
        this._initProgressStream();
        this._initBpsStream();
    }
    getFileStream() {
        throw new Error('not implemented');
    }
    getBlob() {
        throw new Error('not implemented');
    }
    getPin() {
        return this._webrtc.getPin();
    }
    getTransport() {
        return this._webrtc;
    }
    getMeta() {
        return this._metaStream.toPromise();
    }
    getProgress() {
        return this._progressStream;
    }
    getBps() {
        return this._bpsStream;
    }
    dispose() {
        this._webrtc.getWriteBus().onError(new Error(FILE_SENDER_DISPOSED));
    }
    _initSentSizeStream() {
        // First frame always contains a meta information
        this._sentSizeStream = this.getFileStream().skip(1).scan(0, function (sum, data) {
            return sum + data.byteLength;
        }).sample(500/* ms */).shareReplay(1);
    }
    _initProgressStream() {
        this._progressStream  = this._sentSizeStream.combineLatest(this._metaStream, function (size, meta) {
            return size / meta.size * 100;
        }).shareReplay(1);
    }
    _initBpsStream() {
        this._bpsStream = Rx.Observable.combineLatest(
            this._metaStream.map(function () {return Date.now();}),
            this._sentSizeStream,
            function (startTime, sum) {
                return sum / (Date.now() - startTime) * 1000;
            }
        ).shareReplay(1);
    }
}

module.exports = FileTransfer;
