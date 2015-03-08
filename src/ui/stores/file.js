var Rx = require('rx'),
    actions = require('../actions/actions.js'),
    serialDisposable = new Rx.SerialDisposable(),
    dispatcher = require('../dispatcher/dispatcher.js'),
    Store = require('./store.js'),
    pinStore = require('../stores/pin.js'),
    FileSender = require('../../file/file-sender'),
    FileReceiver = require('../../file/file-receiver');

class File extends Store {
    constructor() {
        var isPinValid;
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.SEND_FILE) {
                this.setState({
                    state: 'SENDING',
                    sender: new FileSender(action.file)
                });
            } else if (action.type === actions.PIN_CHANGED) {
                isPinValid = this.isPinValid_(action.pin);

                pinStore.setState({
                    pin: action.pin,
                    isValid: isPinValid
                });

                console.log('isPinValid', isPinValid);
                if (isPinValid) {
                    this.setState({
                        state: 'RECEIVING',
                        receiver: new FileReceiver(action.pin)
                    });
                }
            }
        }, this);
    }
    getDefaultState() {
        return {
            state: 'PENDING'
        };
    }
    isPinValid_(pin) {
        return /^[a-zA-Z0-9]{6}$/.test(pin);
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
