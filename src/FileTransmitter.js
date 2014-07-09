var Rx = require('rx'),
    DataChannel = require('./DataChannel.js');
/**
 * @param {Blob} file
 */
function FileTransmitter(file) {
    this.file = file;
    this.dataChannel = new DataChannel();
    this.dataChannel.connect();
}
FileTransmitter.prototype.get = function () {
    this.dataChannel.getObservable().subscribe(function () {
        console.log(arguments);
    });
};
FileTransmitter.prototype.send = function () {
    var signalSubject =  new Rx.Subject(), self = this;

    signalSubject.scan(-self.CHUNK_SIZE, function (acc) {
        return acc + self.CHUNK_SIZE;
    }).takeWhile(function (offset) {
        return offset < self.file.size;
    }).concatMap(function (offset) {
        return self._readChunk(offset);
    }).subscribe(self.dataChannel.getObserver());

    self.dataChannel.getObserver().subscribe(signalSubject);

    signalSubject.onNext('go');
};
FileTransmitter.prototype._readChunk = function (start)  {
    var chunkBlob = this.file.slice(start, start + this.CHUNK_SIZE);

    return new Promise(function (resolve) {
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
FileTransmitter.prototype.CHUNK_SIZE = 1000;

module.exports = FileTransmitter;
