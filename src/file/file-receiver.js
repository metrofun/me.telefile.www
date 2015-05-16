var FileTransfer = require('./file-transfer.js');

class FileReceiver extends FileTransfer {
    /**
     * @param {String} pin
     */
    constructor(pin) {
        super(pin);

        this._initBlob();
    }
    /**
     * @override
     */
    getFileStream() {
        return this.getTransport().getReadStream();
    }
    getBlob() {
        return this._blobIsLoading.toPromise();
    }
    _initBlob() {
        var options = {type: 'application/octet-stream'};

        // Buffering of blobs allows us to create less blobs,
        // because Chrome can allocate at most 500MB for all blobs
        this._blobIsLoading = this.getFileStream().skip(1).bufferWithCount(2048).map(function (parts) {
            return new Blob(parts, options);
        }).bufferWithCount(2048).reduce(function (acc, blobs) {
            return new Blob([].concat(acc, blobs), options);
        }, new Blob([], options)).publishLast();

        this._blobIsLoading.connect();
    }
}

module.exports = FileReceiver;
