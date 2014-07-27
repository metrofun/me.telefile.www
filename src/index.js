var React = require('react'),
    RSVP = require('rsvp'),
    Rx = require('rx'),
    pageView;

Rx.config.Promise = RSVP.Promise.bind(RSVP);

require('./debug.js');
pageView = require('./app/components/page.jsx');

React.renderComponent(
    pageView(),
    document.body
);
