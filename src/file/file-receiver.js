var _ = require('underscore'),
    FileTransfer = require('./file-transfer.js');
/**
 * @param {String} pin
 */
function FileReceiver(pin) {
    FileTransfer.call(this, pin);

    this._initBlob();
}
FileReceiver.prototype = _.extend(Object.create(FileTransfer.prototype), {
    constructor: FileReceiver,

    /**
     * @override
     */
    getFileStream: function () {
        return this.getTransport().getReadStream();
    },
    getBlob: function () {
        return this._blobIsLoading;
    },
    _initBlob: function () {
        var options = {type: 'application/octet-stream'};

        // Buffering of blobs allows us to create less blobs,
        // because Chrome can allocate at most 500MB for all blobs
        this._blobIsLoading =  this.getFileStream().skip(1).bufferWithCount(2048).map(function (parts) {
            return new Blob(parts, options);
        }).bufferWithCount(2048).reduce(function (acc, blobs) {
            return new Blob([].concat(acc, blobs), options);
        }, new Blob([], options)).toPromise();
    }
});

module.exports = FileReceiver;
