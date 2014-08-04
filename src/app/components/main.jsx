var React = require('react'),
    dispatcher = require('../dispatcher.js'),
    actions = require('../actions/actions.js'),
    fileStore = require('../stores/file-store.js'),
    progressMeter  = require('./progress-meter.jsx'),
    sendWizard = require('./send-wizard.jsx'),
    receiveWizard = require('./receive-wizard.jsx'),
    pinForm = require('./pin-form.jsx');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            file: fileStore.get()
        };
    },
    componentDidMount: function() {
        this.subscription = fileStore.subscribe(function (fileState) {
            this.setState({file: fileState});
        }.bind(this));
    },
    componentWillUnmount: function() {
        this.subscription.dispose();
    },
    render: function () {
        var file = this.state.file;

        return (
            <div className="main">
                <div className="main__title">send files peer-to-peer</div>
                <div className="main__subtitle">securely at maximum speed</div>
                { this.state.file.state !== fileStore.IDLE ? <progressMeter />:'' }
                <sendWizard />
                <receiveWizard />
            </div>
        );
    }
});
