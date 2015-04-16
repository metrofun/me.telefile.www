var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    Button = require('../button/button.jsx'),
    Particles = require('../particles/particles.jsx'),
    Device = require('../device/device.jsx');

class ErrorComponent extends React.Component {
    render() {
        return <div className="about">
            <div className="about__hero hero">
                <div className="hero__text">
                    Fastest way to share files
                    across your devices
                </div>
                <div className="hero__img">
                    <Device type="iphone"/>
                    <Particles />
                    <Device type="ipad"/>
                </div>
            </div>
            <div className="about__features features">
                <div className="features__item">
                    <div className="features__caption">
                        Send pictures from your
                        phone to your computer
                    </div>
                    <div className="features__text">
                        Make a picture on your phone or tablet and send it to your computer with zero setup,
                        right from the browser.
                        You do not need even to register.
                    </div>
                </div>
                <div className="features__item features__item_align_right">
                    <div className="features__caption">
                        Share large video files
                        without a size constraints
                    </div>
                    <div className="features__text">
                        Take a video on your phone and send it to your friends just in two clicks.
                        TeleFile won’t compress it or trim to limit its size,
                        like WhatsApp and many other social networks.
                    </div>
                </div>
                <div className="features__item">
                    <div className="features__caption">
                        Transfer files at maximum
                        network speed
                    </div>
                    <div className="features__text">
                        TeleFile do not limit your speed and do not upload your files to Cloud.
                        Your files are streamed directly from peer to peer at maximum speed of your connection.
                    </div>
                </div>
            </div>
            <div className="controls">
                <Button href="/">Start using for FREE</Button>
            </div>
        </div>;
    }
}

module.exports = ErrorComponent;
