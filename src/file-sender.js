var Rx = require('rx'),
    RSVP = require('rsvp'),
    ReactiveWebrtc = require('./reactive-webrtc.js');
/**
 * @param {Blob} file
 */
function FileSender(file) {
    this.file = file;
    this._reactiveWebrtc = new ReactiveWebrtc();

    this._send();
}
FileSender.prototype = {
    getPin: function () {
        return this._reactiveWebrtc.getPin();
    },
    constructor: FileSender,
    getProgress: function () {
        var observable = this._reactiveWebrtc.getObserver(),
            sizeSequence = observable.skip(1).scan(0, function (sum, data) {
                return sum + data.byteLength;
            });

        return sizeSequence.map(function (size) {
            return Math.floor(size / this.file.size * 100);
        }, this).distinctUntilChanged();
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
            .return(this.file)
            .merge(chunksSequence)
            .subscribe(this._reactiveWebrtc.getObserver());

        this._reactiveWebrtc.getObserver().subscribe(signalSubject);
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
};

module.exports = FileSender;
