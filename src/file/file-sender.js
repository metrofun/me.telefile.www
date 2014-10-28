var Rx = require('rx'),
    RSVP = require('rsvp'),
    _ = require('underscore'),
    FileTransfer = require('./file-transfer.js'),
    Webrtc = require('../network/webrtc.js'),

    FILE_SENDER_DISPOSED = 'File sender disposed';
/**
 * @param {Blob} file
 */
function FileSender(file) {
    FileTransfer.call(this);

    this.file = file;
    this._webrtc = new Webrtc();
    this._send();
}
FileSender.prototype = _.extend(Object.create(FileTransfer.prototype), {
    constructor: FileSender,

    CHUNK_SIZE: 15000,

    getPin: function () {
        return this._webrtc.getPin();
    },
    getTransportBus: function () {
        return this._webrtc.getWriteBus();
    },
    dispose: function () {
        this._webrtc.getWriteBus().onError(new Error(FILE_SENDER_DISPOSED));
    },
    getMeta: function () {
        return new RSVP.Promise(function (resolve) {
            resolve({
                type: this.file.type,
                name: this.file.name,
                size: this.file.size
            });
        }.bind(this));
    },
    _send: function () {
        var self = this,
            signalSubject =  new Rx.Subject(),
            chunksSequence =  signalSubject.scan(-self.CHUNK_SIZE, function (acc) {
                return acc + self.CHUNK_SIZE;
            }).takeWhile(function (offset) {
                return offset < self.file.size;
            }).concatMap(function (offset) {
                return self._readChunk(offset);
            });

        Rx.Observable
            .fromPromise(this.getMeta())
            .merge(chunksSequence)
            .subscribe(this.getTransportBus());

        this.getTransportBus().subscribe(signalSubject);
    },
    _readChunk: function (start)  {
        var chunkBlob = this.file.slice(start, start + this.CHUNK_SIZE);

        return new RSVP.Promise(function (resolve) {
            var reader = new FileReader();

            reader.onload = function () {
                resolve(this.result);
            };

            reader.readAsArrayBuffer(chunkBlob);
        }).catch(function (e) {
            setTimeout(function () {
                throw e;
            });
        });
    }
});

module.exports = FileSender;
