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
            var options = {type: meta.type};
            return this.getFileStream().reduce(function (acc, data) {
                return new Blob([acc, data], options);
            }, new Blob([], options));
        }.bind(this)).toPromise();
    }
});

module.exports = FileReceiver;
