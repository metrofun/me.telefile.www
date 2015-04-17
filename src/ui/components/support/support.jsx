var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    Button = require('../button/button.jsx');

class Support extends React.Component {
    _reset() {
        dispatcher.onNext({ type: actions.RESET });
    }
    render() {
        return <div className="layout support">
            <div className="support__title">Need some help?</div>
            <div className="layout__main">
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
