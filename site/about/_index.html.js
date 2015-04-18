var React = require('react'),
    routerStore = require('../../src/ui/stores/router.js');

routerStore.setState({
    pathname: '/about',
    parent: '/about'
});

module.exports = '<!DOCTYPE html>\n' + React.renderToStaticMarkup(React.createElement(
    require('../../src/ui/components/document/document.jsx')
));
