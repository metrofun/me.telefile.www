var Rx = require('rx'),
    PeerConnection = require('./PeerConnection.js');
/**
 * @param {Blob} file
 */
function FileTransmitter(file) {
    var subject =  new Rx.Subject(),
        source, offset = 0, self = this;

    this.file = file;
    this.processedSize = 0;
    this.peerConnection = new PeerConnection();

    // var source = Rx.Observable.interval(100);
    // source.subscribe(subject);
    source = subject.concatMap(function (cursor) {
        console.log('cursor', cursor);
        return Rx.Observable.fromPromise(self._readBlock(cursor));
    }).concatMap(function (arrayBuffer) {
        return Rx.Observable.generate(0, function (offset) {
            return offset < arrayBuffer.byteLength;
        }, function (offset) {
            return offset += self.CHUNK_SIZE;
        }, function (offset) {
            return arrayBuffer.slice(offset, offset + self.CHUNK_SIZE);
        });
    }).subscribe(function (chunk) {
        console.log(chunk);
        offset += self.CHUNK_SIZE;
        self.peerConnection.send(chunk).then(function () {
        });
    }, function (e) {
        setTimeout(function () {
            throw e;
        });
    }, function () {
        console.log('all', arguments);
    });

    subject.onNext(offset);
}
FileTransmitter.prototype.send = function () {
};
FileTransmitter.prototype._readBlock = function (start)  {
    var blockBlob = this.file.slice(start, start + this.BLOCK_SIZE);
    this.processedSize += this.BLOCK_SIZE;

    return new Promise(function (resolve) {
        var reader = new FileReader();

        reader.onload = function () {
            resolve(this.result);
        };

        reader.readAsArrayBuffer(blockBlob);
    }).catch(function (e) {
        setTimeout(function () {
            throw e;
        });
    });
};
FileTransmitter.prototype.CHUNK_SIZE = 1000;
FileTransmitter.prototype.BLOCK_SIZE = 1000 * 10;

module.exports = FileTransmitter;
