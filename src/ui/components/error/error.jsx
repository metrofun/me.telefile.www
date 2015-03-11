var React = require('react'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx');
    // Layout = require('../layout/layout.jsx');

class ErrorComponent extends React.Component {
    render() {
        return <div className="layout error">
            <div className="layout__main">
                <div className="layout__title">Something went wrong</div>
                <Mobile />
                <Desktop />
            </div>
            <div className="layout__controls">
                <Button>Try again</Button>
            </div>
        </div>;
    }
}

module.exports = ErrorComponent;
