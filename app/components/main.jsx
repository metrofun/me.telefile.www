/** @jsx React.DOM */
var React = require('react'),
    fileStore = require('../stores/file-store.js'),
    wizardTypeSend = require('./wizard-type-send.jsx'),
    wizardTypeReceive = require('./wizard-type-receive.jsx');

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
        var file = this.state.file, title, subtitle;

        if (file.phase === fileStore.IDLE) {
            title = (<div className="wizard__title">send files peer&#8209;to&#8209;peer</div>);
            subtitle = (<div className="wizard__subtitle">securely at maximum speed</div>);
        } else if (file.phase === fileStore.ERROR) {
            title = (<div className="wizard__title">An error has occurred</div>);
            subtitle = (<div className="wizard__subtitle">try to start again</div>);
        }

        return (
            <div className={ "main main_phase_" + file.phase.toLowerCase() }>
                {title}
                {subtitle}
                {file.phase !== fileStore.RECEIVE && <wizardTypeSend />}
                {file.phase !== fileStore.SEND && <wizardTypeReceive />}
            </div>
        );
    }
});
