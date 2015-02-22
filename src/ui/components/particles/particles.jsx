var React = require('react');

class Particles extends React.Component {
    componentDidMount() {
        this.intervalId = setInterval(() => this.forceUpdate(), 300);
    }
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }
    isOverlapping(pos, takenPositions) {
        var minDistanceSqr = 10000 / this.props.quantity / 3;

        return takenPositions.some(function(takenPos) {
            return (Math.pow(takenPos.top - pos.top, 2)
                + Math.pow(takenPos.left - pos.left, 2)) < minDistanceSqr;
        });
    }
    getRandomPosition(takenPositions) {
        var pos = {};

        do {
            pos.top = Math.floor(Math.random() * 100);
            pos.left = Math.floor(Math.random() * 100);
        } while (this.isOverlapping(pos, takenPositions));

        takenPositions.push(pos);

        return {top: pos.top + '%', left: pos.left+ '%'};
    }
    render() {
        var items = [], i,
            takenPositions = [],
            className = 'particles__item particles__item_type_';

        for (i = 0; i < this.props.quantity; i++) {
            items.push(<div className={className + i % 5}
                style={this.getRandomPosition(takenPositions)} />);
        }

        return <div className="particles">{items}</div>;
    }
}
Particles.defaultProps = { quantity: 13 };

module.exports = Particles;
