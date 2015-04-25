var React = require('react');

class UnderConstruction extends React.Component {
    render() {
        return <div className="layout under-construction">
            <div className="layout__main">
                <div className="under-construction__logo">
                </div>
                <div className="under-construction__message">
                    <p>TELEFILE is under construction.</p>
                    <p>More news will be on @<a className="under-construction__link"
                            href="https://twitter.com/TeleFileMe">TeleFileMe</a></p>
                </div>
            </div>
        </div>;
    }
}

module.exports = UnderConstruction;
