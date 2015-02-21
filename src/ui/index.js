var React = require('react'),
    Promise = require('bluebird'),
    Rx = require('rx'),
    Page = require('./components/page/page.jsx');

Rx.config.Promise = Promise;

React.render(React.createElement(Page), document.body);
