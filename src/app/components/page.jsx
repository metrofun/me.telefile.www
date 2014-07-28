var React = require('react'),
    mainView = require('./main.jsx');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="page">
                <div className="navbar">
                    <div className="navbar__brand">
                        <span className="navbar__brand-left">Tele</span>
                        <span className="navbar__brand-right">file</span>
                    </div>
                </div>
                <mainView />
            </div>
        );
    }
});
