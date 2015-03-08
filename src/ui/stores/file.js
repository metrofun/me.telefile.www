var Rx = require('rx'),
    actions = require('../actions/actions.js'),
    serialDisposable = new Rx.SerialDisposable(),
    dispatcher = require('../dispatcher/dispatcher.js'),
    Store = require('./store.js'),
    FileSender = require('../../file/file-sender'),
    FileReceiver = require('../../file/file-receiver');

class File extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.SEND_FILE) {
                this.setState({
                    state: 'SENDING',
                    sender: new FileSender(action.file)
                });
            }
        }, this);
    }
    getDefaultState() {
        return {
            state: 'PENDING'
        };
    }
    onError_() {
        this.setState({
            state: 'ERROR'
        });
    }
    setState(state) {
        super.setState(state);

        if (state.sender) {
            serialDisposable.setDisposable(
                state.sender.getProgress().subscribeOnError(this.onError_, this));
        }
    }
}

module.exports = new File();
