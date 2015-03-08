var React = require('react'),
    routerStore = require('../../stores/router.js'),
    Home = require('../home/home.jsx'),
    Send = require('../send/send.jsx'),
    Header = require('../header/header.jsx');

class Page extends React.Component {
    constructor() {
        super();

        this.stars_ = Array.apply([], {length: 10}).map(function(value, i) {
            return <div className={'page__star page__star_type_' + i} />;
        });
    }
    componentWillMount() {
        this.setState(routerStore.getState());

        this.routerSubscription_ = routerStore.subscribeOnNext(function(state) {
            this.setState(state);
        }, this);
    }
    componentWillUnmount() {
        this.routerSubscription_.dispose();
    }
    getContent_() {
        switch (this.state.pathname) {
            case '/send':
                return <Send />;
            default :
                return <Home />;
        }
    }
    render() {
        return (
            <div className="page">
                <div className="page__shadow"></div>
                {this.stars_}
                <Header />
                {this.getContent_()}
                <div className="footer">
                    <div className="info">from Berlin<i className="info__heart">❤</i>with Love</div>
                </div>
            </div>
        );
    }
}

module.exports = Page;
