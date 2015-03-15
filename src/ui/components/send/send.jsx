var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    common = require('../common/common.js'),
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
        sender.getPin().then((pin) => this.setState({ title: pin }));

        sender.getProgress().first().subscribeOnNext(() => {
            this.setState({ mode: SEND_MODE });
            this._clearWaitingTick();
        });

        this._intervalId = setInterval(this._waitingTick.bind(this), WAITING_TIME_STEP);
    }
    componentWillUnmount() {
        this._clearWaitingTick();
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
            return <div className="page__content send content">
                <div className="page__title">Waiting for receiver</div>
                <div className="page__main">
                    <Mobile />
                    <Process
                        progress={1 - this.state.timeleft / MAX_WAITING_TIME}
                        title={this.state.title}
                        subtitle="copy above pin on another device"
                        footer={common.formatTimeleft(this.state.timeleft)}
                    />
                    <Desktop />
                </div>
                <div className="page__controls">
                    <Button onClick={this._cancel}>Cancel</Button>
                </div>
            </div>;
        } else if (this.state.mode === SEND_MODE) {
            return <Transfer source={fileStore.getState().sender}/>;
        }
    }
};
