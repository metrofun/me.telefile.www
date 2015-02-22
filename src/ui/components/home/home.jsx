var React = require('react'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),
    ButtonTypeReceive= require('../button/button_type_receive.jsx'),
    ButtonTypeSend = require('../button/button_type_send.jsx'),
    Particles = require('../particles/particles.jsx');

class Page extends React.Component {
    render() {
        return <div className="home">
            <div className="lead">
                <div className="lead__text">no limits, no cloud</div>
                <div className="lead__hero">Send a File<br />in Two Clicks</div>
                <div className="lead__text lead__text_align_right">faster, safer, easier</div>
            </div>
            <Mobile />
            <Particles />
            <Desktop />
            <div className="page__controls">
                <ButtonTypeSend />
                <ButtonTypeReceive />
            </div>
        </div>;
    }
}

module.exports = Page;
