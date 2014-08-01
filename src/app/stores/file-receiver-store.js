var Rx = require('rx'),
    dispatcher = require('../dispatcher.js'),
    actions =  require('../actions/actions.js'),
    ReactiveStore = require('./reactive-store-class'),
    FileReceiver = require('../../file-receiver.js');

function FileReceiverStore() {
    var self = this;
    this.subject = new Rx.Subject();

    ReactiveStore.call(this, this.subject, {
        progress: 0
    });

    //RECEIVE_FILE
    dispatcher.filter(function (e) {
        return e.action === actions.RECEIVE_FILE;
    }).flatMap(function (e) {
        self._fileReceiver = new FileReceiver(e.pin);

        return self._fileReceiver.getProgress().map(function (progress) {
            return {
                progress: progress
            };
        });
    }).subscribe(this.subject);
}
FileReceiverStore.prototype = Object.create(Rx.AnonymousObservable.prototype, {
    constructor: {value: FileReceiverStore},
    getBlob: {value: function () {
        if (this._fileReceiver) {
            return this._fileReceiver.getBlob();
        } else {
            throw 'not created';
        }
    }}
});

module.exports = new FileReceiverStore();
