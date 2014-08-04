var React = require('react'),
    fileStore = require('../stores/file-store.js'),
    d3 = require('d3');

module.exports = React.createClass({
    getDefaultProps: function () {
        return {radius: 150, width: 8};
    },
    getInitialState: function () {
        return {
            progress: 0
        };
    },
    componentDidMount: function() {
        this.subscription = fileStore.subscribe(function (fileState) {
            this.setState({progress: fileState.progress});
        }.bind(this));
    },
    componentWillUnmount: function() {
        this.subscription.dispose();
    },
    render: function () {
        var arc = d3.svg.arc()
            .innerRadius(this.props.radius - this.props.width)
            .outerRadius(this.props.radius)
            .startAngle(0)
            .endAngle(function (progress) {
                // 2 * Math.PI / 100 * progress;
                return Math.PI / 50 * progress;
            });

        return (
            <div className="progress-meter">
                <div className="progress-meter__label">{this.state.progress}</div>
                <svg
                    className="progress-meter__circle"
                    width={ 2 * this.props.radius }
                    height={ 2 * this.props.radius }
                    xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <g transform={'translate(' + this.props.radius + ',' + this.props.radius + ')'}>
                        <path
                            className="progress-meter__background-path"
                            d={arc(100)}>
                        </path>
                        <path
                            className="progress-meter__foreground-path"
                            d={arc(this.state.progress)}>
                        </path>
                    </g>
                </svg>
            </div>
        );
    }
});
