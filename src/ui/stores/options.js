var Store = require('./store.js'),
    actions = require('../actions/actions.js'),
    dispatcher = require('../dispatcher/dispatcher.js'),

    STORAGE_KEY = 'options';

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
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }
    _store() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.getState()));
    }
}

module.exports = new Options();
