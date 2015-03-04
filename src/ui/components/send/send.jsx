var React = require('react'),
    Progress = require('../progress/progress.jsx'),
    Button = require('../button/button.jsx');

module.exports = class extends React.Component {
    render() {
        return <div className="page__content send">
            <Progress />
            <div className="page__controls">
                <Button>Cancel</Button>
            </div>
        </div>;

    }
};

