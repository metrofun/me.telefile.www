var React = require('react');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            value: 'estimating'
        };
    },
    humanize: function(Bps) {
        if (Bps < 1024) {
            return Math.round(Bps) + 'Bps';
        } else if (Bps < 1024 * 1024) {
            return Math.round(Bps / 1024) + 'KBps';
        } else {
            return (Bps / 1024 / 1025).toFixed(1) + 'MBps';
        }
    },
    componentDidMount: function() {
        this.subscription = this.props.Bps.subscribe(function (value) {
            this.setState({
                value: this.humanize(value)
            });
        }.bind(this));
    },
    componentWillUnmount: function() {
        if (this.subscription) {
            this.subscription.dispose();
        }
    },
    render: function () {
        return (<span>average speed is {this.state.value}</span>);
    }
});
