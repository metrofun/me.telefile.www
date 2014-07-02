var Rx = require('rx'),
    PeerConnection = require('./PeerConnection.js');
/**
 * @param {Blob} file
 */
function FileTransmitter(file) {
    this.file = file;
    this.processedSize = 0;
    this.peerConnection = new PeerConnection();
}
FileTransmitter.prototype.send = function () {
    var subject =  new Rx.Subject(),
        offset = 0, self = this, block, blockStart;

    subject.concatMap(function (offset) {
        if (!block || offset >= blockStart + self.BLOCK_SIZE) {
            block = Rx.Observable.fromPromise(self._readBlock(offset));
            blockStart = offset;
        } else if (offset >= self.file.size) {
            subject.onCompleted();
        }
        console.log(offset, blockStart);
        return block;
    }).map(function (arrayBuffer) {
        return arrayBuffer.slice(offset - blockStart, offset - blockStart + self.CHUNK_SIZE);
    }).concatMap(function (chunk) {
        return Rx.Observable.fromPromise(self.peerConnection.sendData(chunk));
    }).subscribe(function (chunk) {
        console.log(String.fromCharCode.apply(null, new Uint8Array(chunk)));
        offset += self.CHUNK_SIZE;
        subject.onNext(offset);
    }, function (e) {
        setTimeout(function () {
            throw e;
        });
    }, function () {
        console.log('all', arguments);
    });

    subject.onNext(offset);
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
