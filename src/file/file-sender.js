var Rx = require('rx'),
    RSVP = require('rsvp'),
    _ = require('underscore'),
    FileTransfer = require('./file-transfer.js');
/**
 * @param {Blob} file
 */
function FileSender(file) {
    FileTransfer.call(this);

    this.file = file;
    this._send();
}
FileSender.prototype = _.extend(Object.create(FileTransfer.prototype), {
    constructor: FileSender,

    CHUNK_SIZE: 15000,

    /**
     * @override
     */
    getFileStream: function () {
        return this.getTransport().getWriteBus();
    },
    getBlob: function () {
        return new RSVP.Promise(function (resolve) {
            resolve(this.file);
        });
    },
    _send: function () {
        var self = this,
            signalSubject =  new Rx.Subject();

        signalSubject.scan(-self.CHUNK_SIZE, function (acc) {
            return acc + self.CHUNK_SIZE;
        }).takeWhile(function (offset) {
            return offset < self.file.size;
        }).concatMap(function (offset) {
            return self._readChunk(offset);
        // First message with meta information will trigger signalSubject
        }).startWith({
            type: this.file.type,
            name: this.file.name,
            size: this.file.size
        }).subscribe(this.getFileStream());

        this.getFileStream().subscribe(signalSubject);
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
