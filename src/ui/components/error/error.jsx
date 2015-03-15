var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx');

class ErrorComponent extends React.Component {
    reset_() {
        dispatcher.onNext({ type: actions.RESET });
    }
    render() {
        return <div className="layout error">
            <div className="layout__title">Something went wrong</div>
            <div className="layout__main">
                <Mobile />
                <div className="error__death-star">
                    <span className="bubble-1">SIR...ERROR!</span>
                    <span className="bubble-2">AW SNAP...</span>
                </div>
                <Desktop />
            </div>
            <div className="layout__controls">
                <Button onClick={this.reset_}>Try again</Button>
            </div>
        </div>;
    }
}

module.exports = ErrorComponent;
