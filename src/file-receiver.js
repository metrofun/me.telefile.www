var ReactiveWebrtc = require('./reactive-webrtc.js');
/**
* @param {Blob} file
*/
function FileReceiver(id) {
    this.id = id;
    this._reactiveWebrtc = new ReactiveWebrtc(id);
}
FileReceiver.prototype.getProgress = function () {
    var observable = this._reactiveWebrtc.getObservable(),
        metaSequence = observable.first(),
        sizeSequence = observable.skip(1).scan(0, function (sum, data) {
            return sum + data.byteLength;
        });

    return sizeSequence.combineLatest(metaSequence, function (size, meta) {
        return size / meta.size * 100;
    }).distinctUntilChanged();
};
FileReceiver.prototype.getBlob = function () {
    var observable = this._reactiveWebrtc.getObservable(),
        metaSequence = observable.first(),
        dataSequence = observable.skip(1).reduce(function (acc, data) {
            return new Blob([acc, data]);
        }, new Blob());

    return metaSequence.forkJoin(dataSequence, function (meta, data) {
        return new Blob([data], meta);
    }).toPromise();
};

module.exports = FileReceiver;
