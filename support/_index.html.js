var React = require('react'),
    routerStore = require('../../src/ui/stores/router.js');

routerStore.setState({
    pathname: '/support',
    parent: '/support'
});

module.exports = '<!DOCTYPE html>\n' + React.renderToString(React.createElement(
    require('../../src/ui/components/document/document.jsx')
));
