var React = require('react'),
    Button = require('../button/button.jsx');

module.exports = class extends React.Component {
    render() {
        return <div className="page__content send">
            <div className="page__controls">
                <Button>Cancel</Button>
            </div>
        </div>;

    }
};

