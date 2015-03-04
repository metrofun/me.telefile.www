var Rx = require('rx');

module.exports = class Store extends Rx.AnonymousObservable {
    constructor() {
        this.subject_ = new Rx.ReplaySubject(1);
        this.setState(this.getDefaultState());

        super((observer) => this.subject_.subscribe(observer) );
    }
    getDefaultState() {
        return {};
    }
    getState() {
        return this.state_;
    }
    setState(state) {
        this.state_ = state;
        this.subject_.onNext(state);
    }
};
