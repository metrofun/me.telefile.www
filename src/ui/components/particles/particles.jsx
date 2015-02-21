var React = require('react');

class Particles extends React.Component {
    getRandomPosition(takenPositions) {
        var pos = {},
            quantity = this.props.quantity;

        do {
            pos.top = Math.floor(Math.random(quantity));
            pos.left = Math.floor(Math.random(quantity));
        } while (takenPositions[[pos.top, pos.left]]);

        takenPositions[[pos.top, pos.left]] = true;

        return pos;
    }
    render() {
        return <div className="particles"></div>;

        var items = [], i,
            takenPositions = Object.create(null),
            className = 'particles__item particles__item_type_';

        for (i = 0; i < this.props.quantity; i++) {
            items.push(<div className={className + i % 5}
                style={this.getRandomPosition(takenPositions)} />);
        }

        return <div className="particles">{items}</div>;
    }
}
Particles.defaultProps = { quantity: 15 };

module.exports = Particles;
