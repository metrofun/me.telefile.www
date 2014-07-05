var Rx = require('rx'),
    DataChannel = require('./DataChannel.js');
/**
 * @param {Blob} file
 */
function FileTransmitter(file) {
    this.file = file;
    this.processedSize = 0;
    this.dataChannel = new DataChannel();
    this.dataChannel.connect();
}
FileTransmitter.prototype.get = function () {
    this.dataChannel.getObservable().subscribe(function () {
        console.log(arguments);
    });
};
FileTransmitter.prototype.send = function () {
    var subject =  new Rx.Subject(),
        offset = 0, self = this, blockPromise, blockStart;

    subject.concatMap(function (offset) {
        if (!blockPromise || offset >= blockStart + self.BLOCK_SIZE) {
            blockPromise = self._readBlock(offset);
            blockStart = offset;
        } else if (offset >= self.file.size) {
            subject.onCompleted();
        }
        return blockPromise;
    }).map(function (arrayBuffer) {
        return arrayBuffer.slice(offset - blockStart, offset - blockStart + self.CHUNK_SIZE);
    }).concatMap(function (chunk) {
        return self.dataChannel.sendData(chunk);
    }).subscribe(function () {
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
FileTransmitter.prototype.receive = function () {
};
FileTransmitter.prototype.CHUNK_SIZE = 1000;
FileTransmitter.prototype.BLOCK_SIZE = 1000 * 10;

module.exports = FileTransmitter;
