var React = require('react');

module.exports = class Desktop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: props.progress};
    }
    render() {
        return <div className="desktop device device_type_laptop" />;
    }
};
