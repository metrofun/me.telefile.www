var React = require('react'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js');

class Completed extends React.Component {
    componentWillMount() {
    }
    componentWillUnmount() {
    }
    _cancel() {
        dispatcher.onNext({ type: actions.FILE_TRANSFER_CANCEL });
    }
    render() {
        return <div className="layout completed">
            <div className="layout__title">Transfer completed!</div>
            <div className="layout__main">
                <Mobile />
                <div className="file-list">
                    <div className="file-list__item">
                        <div className="file-list__icon">
                            <span className="file-list__icon-text">PDF</span>
                        </div>
                        <div className="file-list__title">Jeff Morrison JavaScript Unit Testing with Jest JSConf2014</div>
                        <div className="file-list__subtitle">392.2MB</div>
                        <div className="file-list__action"></div>
                    </div>
                </div>
                <Desktop />
            </div>
            <div className="layout__controls">
                <Button onClick={this._cancel}>Back</Button>
            </div>
        </div>;
    }
}

module.exports = Completed;
