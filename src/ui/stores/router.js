var Store = require('./store.js'),
    ReactiveWebrtc = require('../../network/webrtc.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js');

class Router extends Store {
    constructor() {
        super();

        if (ReactiveWebrtc.isSupported())  {
            this._handleDownloadLinks();

            dispatcher.subscribeOnNext(function(action) {
                this.setState({parent: '/'});
                switch (action.type) {
                    case actions.FILE_SEND:
                        return this.setState({ pathname: '/send'});
                    case actions.FILE_COMPLETED:
                        return this.setState({ pathname: '/completed'});
                    case actions.FILE_RECEIVE:
                        // If we came by download link, then remove id from url
                        history.replaceState('', document.title, '/');
                        return this.setState({ pathname: '/receive'});
                    case actions.FILE_ERROR:
                    case actions.PIN_ERROR:
                        return this.setState({ pathname: '/error'});
                    case actions.FILE_SEND_TIMEOUT:
                        case actions.RESET:
                        return this.setState({ pathname: '/' });
                }
            }, this);
        } else {
            this.setState({ pathname: '/not-supported' });
        }
    }
    _handleDownloadLinks() {
        var pin = location.hash.replace(/^#/, '');

        if (pin) {
            // remove hash
            history.replaceState('', document.title, '/' + pin);

            // Implicit dependency
            require('./pin.js');
            dispatcher.onNext({
                type: actions.PIN_CHANGED,
                pin
            });
        }
    }
    _normalizePathname(pathname) {
        return '/' + pathname.substr(1).replace(/\/$/, '');
    }
    getInitialState() {
        var pathname, normalized;
        // Check whether it's a browser
        if (typeof location !== 'undefined') {
            normalized = this._normalizePathname(location.pathname);
            pathname = ~this._PARENT_PAGE_URLS.indexOf(normalized) ?
                normalized:this._DEFAULT_PAGE;
        } else {
            pathname = this._DEFAULT_PAGE;
        }
        return {pathname, parent: pathname};
    }
}

Router.prototype._PARENT_PAGE_URLS = ['/', '/about', '/support'];
Router.prototype._DEFAULT_PAGE = '/';

module.exports = new Router();
