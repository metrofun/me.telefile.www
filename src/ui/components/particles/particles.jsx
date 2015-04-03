var React = require('react');

class Particles extends React.Component {
    render() {
        var items = [], i,
            className = 'particles__item particles__item_type_';

        for (i = 0; i < this.props.quantity; i++) {
            items.push(<div key={i} className={className + i % 5}/>);
        }

        return <div className="particles">{items}</div>;
    }
}
Particles.defaultProps = { quantity: 13 };

module.exports = Particles;
