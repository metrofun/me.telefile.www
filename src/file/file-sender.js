var Rx = require('rx'),
    FileTransfer = require('./file-transfer.js');

class FileSender extends FileTransfer {
    /**
     * @param {Blob} file
     */
    constructor(file) {
        super();

        this._CHUNK_SIZE = 16000;

        this.file = file;
        this._send();
    }
    /**
     * @override
     */
    getFileStream() {
        return this.getTransport().getWriteBus();
    }
    getBlob() {
        return new Promise((resolve) => resolve(this.file));
    }
    _send() {
        var self = this,
            signalSubject =  new Rx.Subject(),
            readChunk = Rx.Observable.fromCallback(this._readFileChunk, this);

        signalSubject.scan(-self._CHUNK_SIZE, function (acc) {
            return acc + self._CHUNK_SIZE;
        }).takeWhile(function (offset) {
            return offset < self.file.size;
        }).concatMap(function (offset) {
            return readChunk(offset);
        // First message with meta information will trigger signalSubject
        }).startWith({
            type: this.file.type,
            name: this.file.name,
            size: this.file.size
        }).subscribe(this.getFileStream());

        this.getFileStream().subscribe(signalSubject);
    }
    _readFileChunk(start, onload)  {
        var chunkBlob = this.file.slice(start, start + this._CHUNK_SIZE),
            reader = new FileReader();

        reader.onload = function () {
            onload(this.result);
        };
        reader.onerror = function (e) {
            throw e;
        };

        reader.readAsArrayBuffer(chunkBlob);
    }
}

module.exports = FileSender;
