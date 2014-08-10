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
            self._initReceiver(new FileReceiver(e.pin));

            return {phase: self.RECEIVE};
        } else if (e.action === ACTIONS.SEND_FILE) {
            self._initSender(new FileSender(e.file));

            return {phase: self.SEND};
        } else if (e.action === ACTIONS.STOP_FILE) {
            self._clean();

            return {phase: self.IDLE};
        }
    }).filter(Boolean).subscribe(this.subject);
}
FileStore.prototype = Object.create(ReactiveStore.prototype);

_.extend(FileStore.prototype, keyMirror({
    IDLE: null,
    RECEIVE: null,
    SEND: null,
    ERROR: null
}), {
    constructor: FileStore,

    getSender: function () {
        return this._sender;
    },
    getReceiver: function () {
        return this._receiver;
    },
    _clean: function () {
        ['_sender', '_receiver'].forEach(function (prop) {
            if (this[prop]) {
                this[prop].stop();
                this[prop] = null;
            }
        }, this);
    },
    _initSender: function (sender) {
        this._clean();
        this._sender = sender;
        this._sender.getProgress().subscribe(undefined, this._onError.bind(this));
    },
    _initReceiver: function (receiver) {
        this._clean();
        this._receiver = receiver;
        this._receiver.getProgress().subscribe(undefined, this._onError.bind(this));
    },
    _onError: function () {
        this.subject.onNext({
            phase: this.ERROR
        });
    }
});

module.exports = new FileStore();
