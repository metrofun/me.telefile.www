var React = require('react');

class Button extends React.Component {
    render() {
        return <div onClick={this.onClick} className="button button_type_send">
            <span className="button__label">SEND</span>
            <span className="button__icon"></span>
        </div>;
    }
}

module.exports = Button;
