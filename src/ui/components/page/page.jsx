var React = require('react'),
    Home = require('../home/home.jsx'),
    Header = require('../header/header.jsx');

class Page extends React.Component {
    render() {
        return (
            <div className="page">
                <div className="page__shadow"></div>
                <Header />
                <Home />
                <div className="footer">
                    <div className="docs">from Berlin<i className="docs__heart">❤</i>with Love</div>
                </div>
            </div>
        );
    }
}

module.exports = Page;
