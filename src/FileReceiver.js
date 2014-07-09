var Rx = require('rx'),
    DataChannel = require('./DataChannel.js');
/**
* @param {Blob} file
*/
function FileReceiver(id) {
    this.id = id;
    this.dataChannel = new DataChannel(id);
    this.dataChannel.connect();
}
FileReceiver.prototype.get = function () {
    this.dataChannel.getObservable().reduce(function (acc, data) {
        return acc.concat(data);
    }, []).subscribe(function (data) {
        console.log(data);
    });
};

module.exports = FileReceiver;
