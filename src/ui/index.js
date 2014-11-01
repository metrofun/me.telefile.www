var React = require('react'),
    RSVP = require('rsvp'),
    Rx = require('rx'),
    pageView;

Rx.config.Promise = RSVP.Promise.bind(RSVP);

pageView = require('./components/page.jsx');

React.renderComponent(
    pageView(),
    document.body
);