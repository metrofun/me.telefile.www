var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js');

class Router extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.SEND_FILE) {
                this.setState({ pathname: '/send' });
            } else if (action.type === actions.FILE_ERROR) {
                this.setState({ pathname: '/error' });
            }
        }, this);
    }
    getDefaultState() {
        return {
            // pathname: '/'
            pathname: '/error'
        };
    }
}

module.exports = new Router();
