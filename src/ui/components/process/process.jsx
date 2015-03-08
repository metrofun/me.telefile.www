var React = require('react'),
    Progress = require('../progress/progress.jsx');

module.exports = class extends React.Component {
    render() {
        return <div className="process">
            <div className="process__main">
                <div className="process__title">
                    {this.props.title}
                </div>
                <div className="process__subtitle">
                    {this.props.subtitle}
                </div>
            </div>
            <Progress value={this.props.progress}/>
            <div className="process__footer">
                {this.props.footer}
            </div>
        </div>;
    }
};

