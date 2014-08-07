var Rx = require('rx'),
    keyMirror = require('react/lib/keyMirror'),

    _ = require('underscore'),
    dispatcher = require('../dispatcher.js'),
    ACTIONS =  require('../actions/actions.js'),
    ReactiveStore = require('./reactive-store-class'),
    FileSender = require('../../file-sender.js'),
    FileReceiver = require('../../file-receiver.js');

function FileStore() {
    var self = this;

    this.subject = new Rx.Subject();

    ReactiveStore.call(this, this.subject, {
        phase: this.IDLE
    });

    dispatcher.map(function (e) {
        if (e.action === ACTIONS.RECEIVE_FILE) {
            self._setReceiver(new FileReceiver(e.pin));

            return {phase: self.RECEIVE};
        } else if (e.action === ACTIONS.SEND_FILE) {
            self._setSender(new FileSender(e.file));

            return {phase: self.SEND};
        }
    }).filter(Boolean).subscribe(this.subject);
}
FileStore.prototype = Object.create(ReactiveStore.prototype);

_.extend(FileStore.prototype, keyMirror({
    IDLE: null,
    RECEIVE: null,
    SEND: null
}), {
    constructor: FileStore,
    _clean: function () {
    },
    _setSender: function (sender) {
        this._clean();
        this._sender = sender;
    },
    _setReceiver: function (receiver) {
        this._clean();
        this._receiver = receiver;
    },
    getSender: function () {
        return this._sender;
    },
    getReceiver: function () {
        return this._receiver;
    }
});

module.exports = new FileStore();
