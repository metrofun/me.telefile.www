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
        var metaSequence = this.getFileStream().first(),
            dataSequence = this.getFileStream().skip(1).reduce(function (acc, data) {
                return new Blob([acc, data]);
            }, new Blob());

        this._blobIsLoading = metaSequence.forkJoin(dataSequence, function (meta, data) {
            return new Blob([data], meta);
        }).toPromise();
    }
});

module.exports = FileReceiver;
