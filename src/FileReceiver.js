var DataChannel = require('./DataChannel.js');
/**
* @param {Blob} file
*/
function FileReceiver(id) {
    this.id = id;
    this.dataChannel = new DataChannel(id);
    this.dataChannel.connect();
}
FileReceiver.prototype.get = function () {
    var observable = this.dataChannel.getObservable(),
        metaSequence = observable.first(),
        dataSequence = observable.skip(1).reduce(function (acc, data) {
            return acc.concat(data);
        }, []);

    metaSequence.forkJoin(dataSequence, function (meta, data) {
        return new Blob(data, meta);
    }).subscribe(function (file) {
        console.log(file);
        window.open(window.URL.createObjectURL(file));
    });
};

module.exports = FileReceiver;
