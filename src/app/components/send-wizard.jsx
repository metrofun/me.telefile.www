var React = require('react'),
    dispatcher = require('../dispatcher.js'),
    actions = require('../actions/actions.js'),
    fileStore = require('../stores/file-store.js'),
    progressMeter  = require('./progress-meter.jsx'),
    pinForm = require('./pin-form.jsx');

module.exports = React.createClass({
    getInitialState: function () {
        return {};
    },
    componentDidMount: function() {
    },
    componentWillUnmount: function() {
    },
    onChange: function (e) {
        var file = e.target.files[0];

        dispatcher.onNext({
            action: actions.SEND_FILE,
            file: file
        });
    },
    render: function () {
        return (
            <div className="send-wizard">
                <img className="send-wizard__image" src="assets/plane.png" alt="send" />
                <div className="send-wizard__control send-file">
                <div className="send-wizard__title">send</div>
                    <input
                        onChange={this.onChange}
                        type="file"
                        className="send-file__input" />
                </div>
            </div>
        );
    }
});
