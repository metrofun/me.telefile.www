var React = require('react'),
    progressAnnulus  = require('./progress-annulus.jsx');
    pinForm = require('./pin-form.jsx');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="main">
                <div className="main__title">send files peer-to-peer</div>
                <div className="main__subtitle">securely at maximum speed</div>
                <progressAnnulus />
                <div className="gate gate_type_send">
                    <img className="gate__image" src="assets/plane.png" alt="send" />
                    <div className="gate__control send-file">
                        <div className="send-file__title">send</div>
                        <input className="send-file__input" type="file" />
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
