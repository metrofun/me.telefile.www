var React = require('react');

class Button extends React.Component {
    render() {
        return <div className="button button_type_receive">
            <input className="button__input" type="text" placeholder="INPUT PIN"/>
            <span className="button__label">RECEIVE</span>
        </div>;
    }
}

module.exports = Button;
