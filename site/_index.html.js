var React = require('react');

module.exports = '<!DOCTYPE html>\n' + React.renderToString(React.createElement(
    require('../src/ui/components/document/document.jsx')
));
