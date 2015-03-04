var React = require('react'),
    RADIUS = 50,
    STROKE = 4;

module.exports = class extends React.Component {
    polarToCartesian_(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    describeArc_(x, y, radius, startAngle, endAngle){
        var start = this.polarToCartesian_(x, y, radius, endAngle);
        var end = this.polarToCartesian_(x, y, radius, startAngle);

        var arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

        var d = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y
        ].join(' ');

        return d;
    }
    getArcPathData_() {
        return this.describeArc_(RADIUS, RADIUS, RADIUS - STROKE / 2, 0, 270);
    }
    render() {
        return <svg className='progress' xmlns='http://www.w3.org/2000/svg'
            viewBox={[0, 0, RADIUS * 2, RADIUS * 2].join(' ')}
            version='1.1'>
            <circle className='progress__circle'
                cx={RADIUS} cy={RADIUS} r={RADIUS - STROKE / 2} strokeWidth={STROKE} />
            <path className='progress__arc'
                d={this.getArcPathData_()}
                strokeWidth={STROKE}/>
        </svg>;
    }
};

