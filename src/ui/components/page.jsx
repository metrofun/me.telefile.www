/** @jsx React.DOM */
var React = require('react'),
    mainView = require('./main.jsx');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="page">
                <div className="navbar">
                    <a className="navbar__brand" href="/">
                        <span className="navbar__brand-left">Tele</span>
                        <span className="navbar__brand-right">file</span>
                    </a>
                </div>
                <mainView />
            </div>
        );
    }
});
