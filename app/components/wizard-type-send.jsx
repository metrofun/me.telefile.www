var React = require('react'),
    dispatcher = require('../dispatcher/dispatcher.js'),
    _ = require('underscore'),
    progressMeter  = require('./progress-meter.jsx'),
    fileStore = require('../stores/file-store.js'),
    speed = require('./speed.jsx'),
    keyMirror = require('react/lib/keyMirror'),
    actions = require('../actions/actions.js');

module.exports = React.createClass(_.extend(keyMirror({
    IDLE: null,
    WAIT_CONNECTION: null,
    SENDING: null,
    READY: null
}), {
    getInitialState: function () {
        return {phase: this.IDLE};
    },
    componentDidMount: function() {
        var self = this;

        this.subscription = fileStore.subscribe(function (fileState) {
            if (fileState.phase === fileStore.SEND) {
                self.replaceState({phase: self.WAIT_CONNECTION});
                fileStore.getSender().getPin().then(function (pin) {
                    if (self.isMounted()) {
                        self.setState({pin: pin});
                    }
                });
                fileStore.getSender().getProgress().take(1).subscribe(function () {
                    self.replaceState({
                        phase: self.SENDING,
                        progress: fileStore.getSender().getProgress(),
                        Bps: fileStore.getSender().getBps()
                    });
                }, undefined, function () {
                    self.replaceState({
                        phase: self.READY
                    });
                });
            } else {
                self.replaceState({phase: self.IDLE});
            }
        });
    },
    componentWillUnmount: function() {
        this.subscription.dispose();
    },
    onCancel: function () {
        dispatcher.onNext({
            action: actions.STOP_FILE
        });
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
                    <div className='wizard__control'onClick={this.onCancel}>
                        <div className='wizard__control-text'>cancel</div>
                    </div>
                </div>
            );
        } else if (this.state.phase === this.SENDING) {
            return (
                <div className='wizard wizard_type_send'>
                    <div className='wizard__title'>Sending in progress</div>
                    <div className='wizard__subtitle'>
                        <speed Bps={this.state.Bps}/>
                    </div>
                    <progressMeter progress={this.state.progress} />
                    <div className='wizard__control' onClick={this.onCancel}>
                        <div className='wizard__control-text'>cancel</div>
                    </div>
                </div>
            );
        } else if (this.state.phase === this.READY) {
            return (
                <div className='wizard wizard_type_send'>
                    <div className='wizard__title'>Sending completed</div>
                    <div className='wizard__subtitle'>
                        <speed Bps={this.state.Bps}/>
                    </div>
                    <progressMeter progress={this.state.progress} />
                    <div className='wizard__control' onClick={this.onCancel}>
                        <div className='wizard__control-text'>back</div>
                    </div>
                </div>
            );
        }
    }
}));
