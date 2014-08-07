var React = require('react'),
    dispatcher = require('../dispatcher.js'),
    _ = require('underscore'),
    progressMeter  = require('./progress-meter.jsx'),
    fileStore = require('../stores/file-store.js'),
    keyMirror = require('react/lib/keyMirror'),
    actions = require('../actions/actions.js');

module.exports = React.createClass(_.extend(keyMirror({
    IDLE: null,
    WAIT_CONNECTION: null,
    SENDING: null
}), {
    getInitialState: function () {
        return {phase: this.IDLE};
    },
    componentDidMount: function() {
        var self = this;

        this.subscription = fileStore.subscribe(function (fileState) {
            if (fileState.phase === fileStore.SEND) {
                this.setState({phase: this.WAIT_CONNECTION});
                fileStore.getSender().getPin().then(function (pin) {
                    self.setState({pin: pin});
                });
                fileStore.getSender().getProgress().take(1).subscribe(function () {
                    self.setState({
                        phase: self.SENDING,
                        progress: fileStore.getSender().getProgress()
                    });
                });
            } else {
                this.setState({phase: this.IDLE});
            }
        }.bind(this));
    },
    componentWillUnmount: function() {
        if (this.subscription) {
            this.subscription.dispose();
        }
    },
    onFileSelect: function (e) {
        var file = e.target.files[0];

        dispatcher.onNext({
            action: actions.SEND_FILE,
            file: file
        });
    },
    render: function () {
        if (this.state.phase === this.IDLE) {
            return (
                <div className='wizard wizard_type_send'>
                    <img className='wizard__image' src='assets/plane.png' alt='send' />
                    <div className='wizard__control send-file'>
                        <div className='wizard__control-text'>send</div>
                        <input onChange={this.onFileSelect} type='file' className='send-file__input' />
                    </div>
                </div>
            );
        } else if (this.state.phase === this.WAIT_CONNECTION) {
            return (
                <div className='wizard wizard_type_send'>
                    <div className='wizard__title'>Waiting for receiver</div>
                    <div className='wizard__subtitle'>Input below pin on another device</div>
                    <div className='wizard__pin'>{ this.state.pin }</div>
                    <div className='wizard__control'>
                        <div className='wizard__control-text'>cancel</div>
                    </div>
                </div>
            );
        } else if (this.state.phase === this.SENDING) {
            return (
                <div className='wizard wizard_type_send'>
                    <div className='wizard__title'>Sending in progress</div>
                    <div className='wizard__subtitle'>average speed is 24kb/s</div>
                    <progressMeter progress={this.state.progress} />
                    <div className='wizard__control'>
                        <div className='wizard__control-text'>cancel</div>
                    </div>
                </div>
            );
        }
    }
}));
