var React = require('react');

class Button extends React.Component {
    render() {
        return <div className="button button_type_send">
            <input className="button__input" type="text" placeholder="INPUT PIN"/>
            <i className="button__label">SEND</i>
        </div>;
    }
}

module.exports = Button;
