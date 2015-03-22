var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js');

class Router extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            console.log(action);
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
    }
    getDefaultState() {
        return {
            // pathname: '/completed'
            // pathname: '/error'
            pathname: '/'
        };
    }
}

module.exports = new Router();
