var React = require('react');

module.exports = class Mobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: props.progress};
    }
    render() {
        return <div className="mobile">
            <div className="device device_type_ipad " />
            <div className="device device_type_iphone" />
        </div>;
    }
};
