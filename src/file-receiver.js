var ReactiveWebrtc = require('./reactive-webrtc.js'),
    _ = require('underscore'),
    AbstractFilePeer = require('./abstract-file-peer.js');
/**
* @param {Blob} file
*/
function FileReceiver(id) {
    AbstractFilePeer.call(this);

    this.id = id;
    this._reactiveWebrtc = new ReactiveWebrtc(id);
}
FileReceiver.prototype = _.extend(Object.create(AbstractFilePeer.prototype), {
    constructor: FileReceiver,

    getWebrtcSubject: function () {
        return this._reactiveWebrtc.getObservable();
    },
    getMeta: function () {
        return this.getWebrtcSubject().take(1).toPromise();
    },
    getBlob: function () {
        if (!this._blobPromise) {
            var observable = this.getWebrtcSubject(),
                metaSequence = observable.first(),
                dataSequence = observable.skip(1).reduce(function (acc, data) {
                    console.log(data);
                    return new Blob([acc, data]);
                }, new Blob());

            this._blobPromise = metaSequence.forkJoin(dataSequence, function (meta, data) {
                return new Blob([data], meta);
            }).toPromise();
        }

        return this._blobPromise;
    },
    terminate: function () {
        this._reactiveWebrtc.terminate();
    }
});

module.exports = FileReceiver;
