var Rx = require('rx'),
    RSVP = require('rsvp'),
    ReactiveWebrtc = require('./reactive-webrtc.js');
/**
 * @param {Blob} file
 */
function FileTransmitter(file) {
    this.file = file;
    this._reactiveWebrtc = new ReactiveWebrtc();
}
FileTransmitter.prototype.send = function () {
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
};
FileTransmitter.prototype._readChunk = function (start)  {
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
};
FileTransmitter.prototype.receive = function () {
};
FileTransmitter.prototype.CHUNK_SIZE = 10000;

module.exports = FileTransmitter;
