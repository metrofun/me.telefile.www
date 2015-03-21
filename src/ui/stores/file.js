var Rx = require('rx'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),
    Store = require('./store.js'),
    FileSender = require('../../file/file-sender'),
    FileReceiver = require('../../file/file-receiver');

class FileStore extends Store {
    constructor() {
        super();

        this.serialDisposable_ = new Rx.SerialDisposable();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.FILE_SEND) {
                this._onFileSend(action.file);
            } else if (action.type === actions.PIN_VALID) {
                this._onValidPin(action.pin);
            } else if (action.type === actions.FILE_TRANSFER_CANCEL) {
                this._cancel();
            }
        }, this);
    }
    getDefaultState() {
        return { state: 'PENDING' };
    }
    _onError() {
        this.replaceState({ state: 'ERROR' });
        dispatcher.onNext({ type: actions.FILE_ERROR});
    }
    _onValidPin(pin) {
        var receiver = new FileReceiver(pin);

        this.replaceState({
            state: 'RECEIVING',
            receiver: receiver
        });

        this.serialDisposable_.setDisposable(new Rx.CompositeDisposable(
            // pick first message to check whether PIN is valid
            receiver.getProgress().first().subscribe(function() {
                dispatcher.onNext({ type: actions.FILE_RECEIVE});
            }, function() {
                dispatcher.onNext({ type: actions.PIN_INVALID });
            }, function() {
                dispatcher.onNext({ type: actions.FILE_COMPLETED});
            }),
            // don't switch to ERROR state, of first message errored.
            // This case is covered by previous line
            receiver.getProgress().skip(1).subscribeOnError(this._onError, this)
        ));
    }
    _cancel() {
        var state = this.getState(),
            transferer = state.sender || state.receiver;

        if (transferer) {
            transferer.dispose();
        }

        this.replaceState({state: 'PENDING'});
    }
    _onFileSend(file) {
        var sender = new FileSender(file);

        this.replaceState({
            state: 'SENDING',
            sender: sender
        });

        this.serialDisposable_.setDisposable(new Rx.CompositeDisposable(
            sender.getProgress().subscribeOnError(() => this._onError),
            sender.getProgress().subscribeOnCompleted(() => dispatcher.onNext({
                type: actions.FILE_COMPLETED
            }))
        ));
    }
}

module.exports = new FileStore();
