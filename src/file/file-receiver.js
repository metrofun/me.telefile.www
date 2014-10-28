var Webrtc = require('../network/webrtc'),
    _ = require('underscore'),
    FileTransfer = require('./file-transfer.js'),

    FILE_RECEIVER_DISPOSED  = 'File receiver disposed';
/**
 * @param {String} pin
 */
function FileReceiver(pin) {
    FileTransfer.call(this);

    this.pin = pin;
    this._webrtc = new Webrtc(pin);

    this.getMeta();
    this.getBlob();
}
FileReceiver.prototype = _.extend(Object.create(FileTransfer.prototype), {
    constructor: FileReceiver,

    getTransportBus: function () {
        return this._webrtc.getReadStream();
    },
    getMeta: function () {
        if (!this._metaPromise) {
            this._metaPromise = this.getTransportBus().take(1).toPromise();
        }
        return this._metaPromise;
    },
    getBlob: function () {
        if (!this._blobPromise) {
            var observable = this.getTransportBus(),
                metaSequence = observable.first(),
                dataSequence = observable.skip(1).reduce(function (acc, data) {
                    return new Blob([acc, data]);
                }, new Blob());

            this._blobPromise = metaSequence.forkJoin(dataSequence, function (meta, data) {
                return new Blob([data], meta);
            }).toPromise();
        }

        return this._blobPromise;
    },
    dispose: function () {
        this._webrtc.getWriteBus().onError(new Error(FILE_RECEIVER_DISPOSED));
    }
});

module.exports = FileReceiver;
