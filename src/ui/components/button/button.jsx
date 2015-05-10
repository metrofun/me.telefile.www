var React = require('react');

class Button extends React.Component {
    render() {
        if (this.props.onClick) {
            return <div className="button">
                <span role="button" onClick={this.props.onClick} className="button__text">
                    {this.props.children}
                </span>
            </div>;
        } else {
            return <div className="button">
                <a href={this.props.href} target={this.props.target} className="button__text">
                    {this.props.children}
                </a>
            </div>;
        }
    }
}

module.exports = Button;
