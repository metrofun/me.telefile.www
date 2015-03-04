var React = require('react');

class Button extends React.Component {
    render() {
        return <div className="button">
            <label className="button__label">
                {this.props.children}
            </label>
        </div>;
    }
}

module.exports = Button;
