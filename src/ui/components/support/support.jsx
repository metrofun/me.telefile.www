var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    Device = require('../device/device.jsx'),
    Button = require('../button/button.jsx');

class Support extends React.Component {
    _reset() {
        dispatcher.onNext({ type: actions.RESET });
    }
    render() {
        return <div className="support">
            <div className="support__main">
                <Device type="laptop">
                    <div className="support__water">
                        <div className="support__bubble" />
                        <div className="support__bubble" />
                        <div className="support__bubble" />
                        <div className="support__bubble" />
                    </div>
                </Device>
                <div className="support__lifebelt"></div>
                <div className="support__title">Need some help?</div>
                <div className="support__text">
                    <p>Not working?</p>
                    <p>Do not know how to use?</p>
                    <p>Feel free to get in touch with us</p>
                </div>
            </div>
            <div className="controls">
                <Button href="mailto:support@telefile.me?subject=Support" target="_blank">
                    Connect
                </Button>
            </div>
        </div>;
    }
}

module.exports = Support;
