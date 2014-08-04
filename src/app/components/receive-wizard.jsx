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
            <div className="receive-wizard">
                <img className="receive-wizard__image" src="assets/file.png" alt="receive"/>
                <pinForm className="receive-wizard__control" />
            </div>
        );
    }
});
