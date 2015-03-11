var React = require('react'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx');

class Layout extends React.Component {
    render() {
        var className = 'layout';

        if (this.props.type) {
            className += ' layout_type_' + this.props.type;
        }
        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        return <div className={className}>
            <Mobile />
            <Desktop />
            {this.props.children}
        </div>;
    }
}

module.exports = Layout;
