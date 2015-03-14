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
        var self = this;

        this.setState({
            timeleft: MAX_TIME,
            title: '----'
        });

        fileStore.getState().sender.getPin().then(function(pin) {
            self.setState({
                title: pin
            });
        });

        this.intervalId_ = setInterval(function() {
            if (self.state.timeleft) {
                self.setState({timeleft: self.state.timeleft - 1});
            } else {
                dispatcher.onNext({ type: actions.FILE_SEND_TIMEOUT });
                clearInterval(self.intervalId_);
            }
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.intervalId_);
    }
    pad_(value) {
        return value < 10 ? '0' + value:value;
    }
    secondsToTimeLabel_(seconds) {
        return this.pad_(Math.floor(seconds / 60) % 60) + ':' + this.pad_(seconds % 60);
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
                        footer={this.secondsToTimeLabel_(this.state.timeleft)}
                    />
                    <Desktop />
                </div>
                <div className="page__controls">
                    <Button>Cancel</Button>
                </div>
        </div>;

    }
};
