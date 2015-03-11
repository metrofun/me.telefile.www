var Rx = require('rx'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),
    Store = require('./store.js'),
    FileSender = require('../../file/file-sender'),
    FileReceiver = require('../../file/file-receiver');

class File extends Store {
    constructor() {
        super();

        this.serialDisposable_ = new Rx.SerialDisposable();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.FILE_SEND) {
                this.onFileSend_(action.file);
            } else if (action.type === action.PIN_VALID) {
                this.onValidPin_(action.pin);
            }
        }, this);
    }
    getDefaultState() {
        return { state: 'PENDING' };
    }
    onError_() {
        this.setState({ state: 'ERROR' });
        dispatcher.onNext({ type: actions.FILE_ERROR});
    }
    onValidPin_(pin) {
        var receiver = new FileReceiver(pin);

        this.setState({
            state: 'RECEIVING',
            receiver: receiver
        });

        this.serialDisposable_.setDisposable(new Rx.CompositeDisposable(
            // pick first message to check whether PIN is valid
            receiver.first().subscribe(function() {
                dispatcher.onNext({ type: actions.FILE_RECEIVE});
            }, function() {
                dispatcher.onNext({ type: actions.PIN_INVALID });
            }),
            // don't switch to ERROR state, of first message errored.
            // This case is covered by previous line
            receiver.getProgress().skip(1).subscribeOnError(this.onError_, this)
        ));
    }
    onFileSend_(file) {
        var sender = new FileSender(file);

        this.setState({
            state: 'SENDING',
            sender: sender
        });

        this.serialDisposable_.setDisposable(
            sender.getProgress().subscribeOnError(this.onError_, this));
    }
}

module.exports = new File();
