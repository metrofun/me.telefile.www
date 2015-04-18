var React = require('react'),
    routerStore = require('../src/ui/stores/router.js');

routerStore.setState({
    pathname: '/',
    parent: '/'
});

module.exports = '<!DOCTYPE html>\n' + React.renderToStaticMarkup(React.createElement(
    require('../src/ui/components/document/document.jsx')
));
