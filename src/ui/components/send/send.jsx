var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    fileStore = require('../../stores/file.js'),
    Process = require('../process/process.jsx'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),

    MAX_TIME = 10 * 60;

module.exports = class extends React.Component {
    componentWillMount() {
        this.setState({ timeleft: MAX_TIME, title: '----' });

        fileStore.getState().sender.getPin().then((pin) => this.setState({
            title: pin
        }));

        this.intervalId_ = setInterval(() => {
            if (this.state.timeleft) {
                this.setState({timeleft: this.state.timeleft - 1});
            } else {
                dispatcher.onNext({ type: actions.FILE_SEND_TIMEOUT });
                clearInterval(this.intervalId_);
            }
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.intervalId_);
    }
    _pad(value) {
        return value < 10 ? '0' + value:value;
    }
    _secondsToTimeLabel(seconds) {
        return this._pad(Math.floor(seconds / 60) % 60) + ':' + this._pad(seconds % 60);
    }
    _cancel() {
        dispatcher.onNext({ type: actions.FILE_TRANSFER_CANCEL });
    }
    render() {
        return <div className="page__content send content">
            <div className="page__title">Waiting for receiver</div>
                <div className="page__main">
                    <Mobile />
                    <Process
                        progress={1 - this.state.timeleft / MAX_TIME}
                        title={this.state.title}
                        subtitle="copy above pin on another device"
                        footer={this._secondsToTimeLabel(this.state.timeleft)}
                    />
                    <Desktop />
                </div>
                <div className="page__controls">
                    <Button onClick={this._cancel}>Cancel</Button>
                </div>
        </div>;
    }
};
