var React = require('react'),
    Device = require('../device/device.jsx');

module.exports = class Mobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: props.progress};
    }
    render() {
        return <div className="mobile">
            <Device type="ipad"/>
            <Device type="iphone"/>
        </div>;
    }
};
