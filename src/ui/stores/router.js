var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js');

class Router extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.SEND_FILE) {
                this.setState({
                    pathname: '/send'
                });
            }
        }, this);
    }
    getDefaultState() {
        return {
            pathname: '/'
            // pathname: '/send'
        };
    }
}

module.exports = new Router();
