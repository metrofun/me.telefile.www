var React = require('react'),
    Device = require('../device/device.jsx');

module.exports = class Desktop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: props.progress};
    }
    render() {
        return <Device className="desktop" type="laptop" />;
    }
};
