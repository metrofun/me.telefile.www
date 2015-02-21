var React = require('react');

class Button extends React.Component {
    render() {
        return <div className="button">
            <i className="button__label">{this.props.label}</i>
            {this.props.children}
        </div>;
    }
}

module.exports = Button;
