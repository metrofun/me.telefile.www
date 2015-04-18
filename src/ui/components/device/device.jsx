var React = require('react');

module.exports = class Device extends React.Component {
    render() {
        var className = 'device device_type_' + this.props.type;

        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        return <div className={className}>
            <div className="device__background">
                {this.props.children}
            </div>;
        </div>;
    }
};
