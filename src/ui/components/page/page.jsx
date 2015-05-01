var React = require('react'),
    routerStore = require('../../stores/router.js'),
    Home = require('../home/home.jsx'),
    Send = require('../send/send.jsx'),
    Completed = require('../completed/completed.jsx'),
    fileStore = require('../../stores/file.js'),
    Transfer = require('../transfer/transfer.jsx'),
    NotSupported = require('../not-supported/not-supported.jsx'),
    ErrorComponent = require('../error/error.jsx'),
    About = require('../about/about.jsx'),
    Support = require('../support/support.jsx'),
    Header = require('../header/header.jsx');

class Page extends React.Component {
    constructor(props) {
        super(props);

        this.state = routerStore.getState();

        this.stars_ = <div className="page__stars">
            {Array.apply([], {length: 10}).map((value, i) =>
                <div key={i} className={'page__star page__star_type_' + i} />)}
        </div>;
    }
    componentDidMount() {
        this.routerSubscription_ = routerStore.subscribeOnNext(function(state) {
            var source;

            if (state.pathname === '/completed') {
                source = fileStore.getState().receiver || fileStore.getState().sender;
                Promise.all([source.getBlob(), source.getMeta()]).then(values => this.setState({
                    blob: values[0],
                    meta: values[1],
                    pathname: state.pathname
                }));
            } else {
                this.setState(state);
            }
        }, this);
    }
    componentWillUnmount() {
        this.routerSubscription_.dispose();
    }
    getContent_() {
        switch (this.state.pathname) {
            case '/send':
                return <Send />;
            case '/receive':
                return <Transfer source={fileStore.getState().receiver}/>;
            case '/completed':
                return <Completed blob={this.state.blob} meta={this.state.meta}/>;
            case '/error':
                return <ErrorComponent />;
            case '/not-supported':
                return <NotSupported />;
            case '/about':
                return <About />;
            case '/support':
                return <Support />;
            default :
                return <Home />;
        }
    }
    render() {
        var className = 'page page_type_' +
            // skip slash
            this.state.pathname.substr(1);

        return (
            <div className={className}>
                <div className="page__shadow"></div>
                {this.stars_}
                <Header />
                {this.getContent_()}
                <div className="footer">
                    <div className="info">made with<i className="info__heart">❤</i>by <a
                            target="_blank"
                            className="info__link"
                            href="http://twitter.com/MeTroFuN">@metrofun</a></div>
                </div>
            </div>
        );
    }
}
module.exports = Page;
