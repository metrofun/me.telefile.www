var React = require('react');

class Button extends React.Component {
    render() {
        if (this.props.onClick) {
            return <div className="button">
                <span onClick={this.props.onClick} className="button__text">
                    {this.props.children}
                </span>
            </div>;
        } else {
            return <div className="button">
                <a href={this.props.href} className="button__text">
                    {this.props.children}
                </a>
            </div>;
        }
    }
}

module.exports = Button;
