var ReactiveWebrtc = require('./reactive-webrtc.js');
/**
* @param {Blob} file
*/
function FileReceiver(id) {
    this.id = id;
    this._reactiveWebrtc = new ReactiveWebrtc(id);
}
FileReceiver.prototype.get = function () {
    var observable = this._reactiveWebrtc.getObservable(),
        metaSequence = observable.first(),
        dataSequence = observable.skip(1).reduce(function (acc, data) {
            return new Blob([acc, data]);
        }, new Blob());

    metaSequence.forkJoin(dataSequence, function (meta, data) {
        return new Blob([data], meta);
    }).subscribe(function (file) {
        console.log(file);
        window.open(window.URL.createObjectURL(file));
    });
};

module.exports = FileReceiver;
