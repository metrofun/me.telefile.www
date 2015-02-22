require('react/addons');
var React = require('react');

module.exports = class Device extends React.Component {
    render() {
        var cx =  React.addons.classSet,
            classes = {
                'device': true
            };
        classes[this.props.className || ''] = true;
        classes['device_type_' + this.props.type] = true;

        return <div className={cx(classes)}>
            <div className="device__background" />
        </div>;
    }
};
