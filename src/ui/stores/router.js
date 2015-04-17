var Store = require('./store.js'),
    Env = require('../../env/current.js'),
    ReactiveWebrtc = require('../../network/webrtc.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js');

class Router extends Store {
    constructor() {
        super();

        if (Env.IS_NODE || ReactiveWebrtc.isSupported())  {
            dispatcher.subscribeOnNext(function(action) {
                switch (action.type) {
                    case actions.FILE_SEND:
                        return this.setState({ pathname: '/send' });
                    case actions.FILE_COMPLETED:
                        return this.setState({ pathname: '/completed' });
                    case actions.FILE_RECEIVE:
                        return this.setState({ pathname: '/receive' });
                    case actions.FILE_ERROR:
                        return this.setState({ pathname: '/error' });
                    case actions.FILE_SEND_TIMEOUT:
                    case actions.FILE_TRANSFER_CANCEL:
                    case actions.RESET:
                        return this.setState({ pathname: '/' });
                }
            }, this);
        } else {
            this.setState({ pathname: '/not-supported' });
        }
    }
    getDefaultState() {
        return {
            // pathname: '/completed'
            // pathname: '/error'
            // pathname: '/not-supported'
            // pathname: '/receive'
            // pathname: '/'
            // pathname: '/about'
            pathname: '/support'
        };
    }
}

module.exports = new Router();
