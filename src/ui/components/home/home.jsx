var React = require('react'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),
    ButtonTypeReceive = require('../button/button_type_receive.jsx'),
    ButtonTypeSend = require('../button/button_type_send.jsx'),
    Particles = require('../particles/particles.jsx');

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            animated: this.props.animated
        };
    }
    componentDidMount() {
        setTimeout(this.setState.bind(this, {
            animated: false
        }), 700);
    }
    render() {
        return <div className="layout home">
            <div className="layout__main">
                <div className="lead">
                    <div className="lead__text">from peer to peer</div>
                    <div className="lead__hero">Send a File<br />in Two Clicks</div>
                    <div className="lead__text lead__text_align_right">no limits, faster than cloud</div>
                </div>
                <Mobile />
                <Particles />
                <Desktop />
            </div>
            <div className="controls">
                <ButtonTypeSend />
                <ButtonTypeReceive />
            </div>
        </div>;
    }
}

Home.defaultProps = { animated: true };

module.exports = Home;
