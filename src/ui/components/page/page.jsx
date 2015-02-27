var React = require('react'),
    Home = require('../home/home.jsx'),
    Header = require('../header/header.jsx');

class Page extends React.Component {
    render() {
        var stars = Array.apply([], {length: 10}).map(function(value, i) {
            return <div className={'page__star page__star_type_' + i} />;
        });

        return (
            <div className="page">
                <div className="page__shadow"></div>
                {stars}
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
