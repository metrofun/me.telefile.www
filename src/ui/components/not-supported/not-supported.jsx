var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    Button = require('../button/button.jsx');

class NotSupported extends React.Component {
    reset_() {
        dispatcher.onNext({ type: actions.RESET });
    }
    render() {
        return <div className="layout not-supported">
            <div className="layout__main">
                <div className="not-supported__logo">
                </div>
                <div className="not-supported__message">
                    <p>TELEFILE only works in WebRTC enabled browsers.</p>
                    <p className="not-supported__desktop-only">WebRTC is an technology for browser-to-browser communication.</p>
                </div>
            </div>
            <div className="controls controls_type_vertical">
                <Button href="https://www.mozilla.org/en-US/firefox/new/">
                    <span className="not-supported__desktop-only">Download Firefox</span>
                    <span className="not-supported__mobile-only">Get Firefox</span>
                </Button>
                <Button href="https://www.google.com/chrome/">
                    <span className="not-supported__desktop-only">Download Chrome</span>
                    <span className="not-supported__mobile-only">Get Chrome</span>
                </Button>
            </div>
        </div>;
    }
}

module.exports = NotSupported;
