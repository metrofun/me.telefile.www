var React = require('react'),
    dispatcher = require('../dispatcher.js'),
    actions = require('../actions/actions.js'),
    fileStore = require('../stores/file-store.js'),
    progressMeter  = require('./progress-meter.jsx'),
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
    onChange: function (e) {
        var file = e.target.files[0];

        dispatcher.onNext({
            action: actions.SEND_FILE,
            file: file
        });
    },
    render: function () {
        var file = this.state.file;

        return (
            <div className="main">
                <div className="main__title">send files peer-to-peer</div>
                <div className="main__subtitle">securely at maximum speed</div>
                { this.state.file.state !== fileStore.IDLE ? <progressMeter />:'' }
                <div className="gate gate_type_send">
                    <img className="gate__image" src="assets/plane.png" alt="send" />
                    <div className="gate__control send-file">
                        <div className="send-file__title">send</div>
                        <input
                            onChange={this.onChange}
                            type="file"
                            className="send-file__input" />
                    </div>
                </div>
                <div className="gate gate_type_receive">
                    <img className="gate__image" src="assets/file.png" alt="receive"/>
                    <pinForm className="gate__control" />
                </div>
            </div>
        );
    }
});
