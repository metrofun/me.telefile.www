var Rx = require('rx'),
    RSVP = require('rsvp'),
    _ = require('underscore'),
    AbstractFilePeer = require('./abstract-file-peer.js'),
    ReactiveWebrtc = require('./reactive-webrtc.js');
/**
 * @param {Blob} file
 */
function FileSender(file) {
    AbstractFilePeer.call(this);

    this.file = file;
    this._reactiveWebrtc = new ReactiveWebrtc();
    this._send();
}
FileSender.prototype = _.extend(Object.create(AbstractFilePeer.prototype), {
    constructor: FileSender,

    getPin: function () {
        return this._reactiveWebrtc.getPin();
    },
    getWebrtcSubject: function () {
        return this._reactiveWebrtc.getObserver();
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
            .subscribe(this.getWebrtcSubject());

        this.getWebrtcSubject().subscribe(signalSubject);
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
    },
    CHUNK_SIZE: 32768
});

module.exports = FileSender;
