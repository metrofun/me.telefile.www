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
        this._blobIsLoading = this.getFileStream().first().concatMap(function (meta) {
            console.log(meta);
            return this.getFileStream().reduce(function (acc, data) {
                return new Blob([acc, data], meta);
            }, new Blob([], meta)).log('blob');
        }.bind(this)).toPromise().catch(function (err) {
            console.error(err);
        });
    }
});

module.exports = FileReceiver;
