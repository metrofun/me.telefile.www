var React = require('react'),
    fileStore = require('../../stores/file.js'),
    Process = require('../process/process.jsx'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),

    MAX_TIME = 10 * 60;

module.exports = class extends React.Component {
    componentWillMount() {
        var that = this;

        this.setState({
            timeleft: MAX_TIME,
            title: '----'
        });

        console.log(fileStore.getState());
        fileStore.getState().sender.getPin().then(function(pin) {
            that.setState({
                title: pin
            });
        });

        this.intervalId_ = setInterval(function() {
            that.setState({timeleft: that.state.timeleft - 1});
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

