var React = require('react'),
    routerStore = require('../../stores/router.js'),
    Home = require('../home/home.jsx'),
    Send = require('../send/send.jsx'),
    Completed = require('../completed/completed.jsx'),
    fileStore = require('../../stores/file.js'),
    Transfer = require('../transfer/transfer.jsx'),
    ErrorComponent = require('../error/error.jsx'),
    Header = require('../header/header.jsx');

class Page extends React.Component {
    constructor() {
        super();

        this.stars_ = <div className="page__stars">
            {Array.apply([], {length: 10}).map((value, i) =>
                <div className={'page__star page__star_type_' + i} />)}
        </div>;
    }
    componentWillMount() {
        this.setState(routerStore.getState());

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
