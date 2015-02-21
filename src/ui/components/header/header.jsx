var React = require('react');

class Header extends React.Component {
    render() {
        return (
            <div className="header">
                <div className="brand">
                    <div className="brand__tele">tele</div>
                    <div className="brand__logo"></div>
                    <div className="brand__file">file</div>
                </div>
                <ul className="share">
                    <li className="share__item share__twitter"></li>
                    <li className="share__item share__facebook"></li>
                    <li className="share__item share__linkedin"></li>
                </ul>
                <ul className="navbar">
                    <li className="navbar__item navbar__item_type_active">Home</li>
                    <li className="navbar__item">About</li>
                    <li className="navbar__item">Contact</li>
                </ul>
            </div>
        );
    }
}

module.exports = Header;
