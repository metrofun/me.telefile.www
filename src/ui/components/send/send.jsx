var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    fileStore = require('../../stores/file.js'),
    Process = require('../process/process.jsx'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),
    Transfer = require('../transfer/transfer.jsx'),

    WAIT_MODE = 'wait mode',
    SEND_MODE = 'send mode',
    WAITING_TIME_STEP = 1000,
    MAX_WAITING_TIME = 10 * 60;

module.exports = class extends React.Component {
    componentWillMount() {
        var sender = fileStore.getState().sender;

        this.setState({
            mode: WAIT_MODE,
            timeleft: MAX_WAITING_TIME,
            title: '----'
        });
        sender.getPin().then(
            (title) => this.setState({ title }),
            () => dispatcher.onNext({ type: actions.PIN_ERROR })
        );

        sender.getProgress().first().subscribe(() => {
            this.setState({ mode: SEND_MODE });
            this._clearWaitingTick();
        }, () => dispatcher.onNext({ type: actions.FILE_ERROR }));

        this._intervalId = setInterval(this._waitingTick.bind(this), WAITING_TIME_STEP);
    }
    componentWillUnmount() {
        this._clearWaitingTick();
    }
    _pad(value) {
        return value < 10 ? '0' + value:value;
    }
    /**
     * Format seconds to "mm:ss"
     * @param {number} seconds
     */
    _formatTimeleft(seconds) {
        return this._pad(Math.floor(seconds / 60) % 60) + ':' + this._pad(seconds % 60);
    }
    _waitingTick() {
        if (this.state.timeleft) {
            this.setState({timeleft: this.state.timeleft - 1});
        } else {
            dispatcher.onNext({ type: actions.FILE_SEND_TIMEOUT });
            this._clearWaitingTick();
        }
    }
    _clearWaitingTick() {
        clearInterval(this._intervalId);
    }
    _cancel() {
        dispatcher.onNext({ type: actions.FILE_TRANSFER_CANCEL });
    }
    render() {
        if (this.state.mode === WAIT_MODE) {
            return <div className="layout">
                <div className="layout__title">Waiting for receiver</div>
                <div className="layout__main">
                    <Mobile />
                    <Process
                        progress={1 - this.state.timeleft / MAX_WAITING_TIME}
                        title={this.state.title}
                        subtitle="copy above pin on another device"
                        footer={this._formatTimeleft(this.state.timeleft)}
                    />
                    <Desktop />
                </div>
                <div className="controls">
                    <Button onClick={this._cancel}>Cancel</Button>
                </div>
            </div>;
        } else if (this.state.mode === SEND_MODE) {
            return <Transfer source={fileStore.getState().sender}/>;
        }
    }
};
