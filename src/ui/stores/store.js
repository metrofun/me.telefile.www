var Rx = require('rx'),
    assign = require('react/lib/Object.assign.js');

module.exports = class Store extends Rx.AnonymousObservable {
    constructor() {
        this.subject_ = new Rx.ReplaySubject(1);
        this.replaceState(this.getDefaultState());

        super((observer) => this.subject_.subscribe(observer) );
    }
    getDefaultState() {
        return {};
    }
    getState() {
        return this.state_;
    }
    setState(state) {
        this.replaceState(assign(this.state_, state));
    }
    replaceState(state) {
        this.state_ = state;
        this.subject_.onNext(state);
    }
};
