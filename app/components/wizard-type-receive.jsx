/** @jsx React.DOM */
var React = require('react'),
    dispatcher = require('../dispatcher/dispatcher.js'),
    actions = require('../actions/actions.js'),
    _ = require('underscore'),
    progressMeter  = require('./progress-meter.jsx'),
    keyMirror = require('react/lib/keyMirror'),
    fileStore = require('../stores/file-store.js'),
    speed = require('./speed.jsx'),
    pinForm = require('./pin-form.jsx');

module.exports = React.createClass(_.extend(keyMirror({
    IDLE: null,
    RECEIVING: null
}), {
    getInitialState: function () {
        return {phase: this.IDLE};
    },
    componentDidMount: function() {
        var self = this;

        this.subscription = fileStore.subscribe(function (fileState) {
            if (fileState.phase === fileStore.RECEIVE) {
                self.replaceState({
                    phase: self.RECEIVING,
                    progress: fileStore.getReceiver().getProgress(),
                    Bps: fileStore.getReceiver().getBps()
                });

                fileStore.getReceiver().getBlob().then(function (blob) {
                    return fileStore.getReceiver().getMeta().then(function (meta) {
                        return self.replaceState({
                            phase: self.READY,
                            blob: blob,
                            meta: meta
                        });
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
    onChange: function (e) {
        var file = e.target.files[0];

        dispatcher.onNext({
            action: actions.SEND_FILE,
            file: file
        });
    },
    onCancel: function () {
        dispatcher.onNext({
            action: actions.STOP_FILE
        });
    },
    render: function () {
        if (this.state.phase === this.IDLE) {
            return (
                <div className='wizard wizard_type_receive'>
                    <img className='wizard__image' src='assets/file.png' alt='receive'/>
                    <pinForm className='wizard__control' />
                </div>
            );
        } else if (this.state.phase === this.RECEIVING) {
            return (
                <div className='wizard wizard_type_receive'>
                    <div className='wizard__title'>Receiving in progress</div>
                    <div className='wizard__subtitle'>
                        <speed Bps={this.state.Bps} />
                    </div>
                    <progressMeter progress={this.state.progress} />
                    <div className='wizard__control' onClick={this.onCancel}>
                        <div className='wizard__control-text'>cancel</div>
                    </div>
                </div>
            );
        } else if (this.state.phase === this.READY) {
            return (
                <div className='wizard wizard_type_receive'>
                    <div className='wizard__title'>Receiving completed</div>
                        <div className='wizard__subtitle'>
                        <speed Bps={this.state.Bps} />
                    </div>
                    <progressMeter progress={this.state.progress} />
                    <a
                        className='wizard__control'
                        download={this.state.meta.name}
                        href={window.URL.createObjectURL(this.state.blob)}>
                        SAVE
                    </a>
                </div>
            );
        }
    }
}));