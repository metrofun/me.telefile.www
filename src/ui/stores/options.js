var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js');

class Options extends Store {
    constructor() {
        super();

        dispatcher.subscribeOnNext(function(action) {
            if (action.type === actions.SEND_OPTIONS_CHANGED) {
                this.setState(action.options);
                this._store();
            }
        }, this);
    }
    getInitialState() {
        var item = localStorage.getItem('options');
        try {
            return JSON.parse(item) || {};
        } catch (e) {
            return {};
        }
    }
    _store() {
        localStorage.setItem('options', JSON.stringify(this.getState()));
    }
}

module.exports = new Options();
