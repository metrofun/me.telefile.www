var React = require('react'),
    Rx = require('rx'),
    Env = require('../env/current.js'),
    Page;

Rx.config.Promise = Promise;
if (Env.IS_DEBUG) {
    Rx.Observable.prototype.log = function (ns) {
        ns = ns || '';
        return this.do(function (data) {
            console.log(ns + ' onNext', data);
        }, function (e) {
            console.log(ns + ' onError', e);
        }, function () {
            console.log(ns + ' onCompleted');
        });
    };

    // @see https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/testing.md
    Rx.config.longStackSupport = true;
}


Page = require('./components/page/page.jsx');

React.render(React.createElement(Page), document.body);
