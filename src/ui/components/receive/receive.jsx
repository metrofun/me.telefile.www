var React = require('react'),
    common = require('../common/common.js'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    fileStore = require('../../stores/file.js'),
    Process = require('../process/process.jsx'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx');

class ReceiveComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;
    }
    componentWillMount() {
        var receiver = fileStore.getState().receiver;

        receiver.getProgress().subscribeOnNext((progress) => this.setState({ progress }));
        receiver.getBps().subscribeOnNext((Bps) => {
            this.setState({
                subtitle: 'Average speed is ' + common.BpsToHuman(Bps)
            });
        });
    }
    componentWillUnmount() {
    }
    _cancel() {
        dispatcher.onNext({ type: actions.FILE_TRANSFER_CANCEL });
    }
    render() {
        return <div className="layout receive">
            <div className="layout__title">Transferring some bytes</div>
            <div className="layout__main">
                <Mobile />
                <Process
                    progress={this.state.progress / 100}
                    title={common.formatProgress(this.state.progress) + '%'}
                    subtitle={this.state.subtitle}
                    footer="01:22"
                />
                <Desktop />
            </div>
            <div className="layout__controls">
                <Button onClick={this._cancel}>Cancel</Button>
            </div>
        </div>;
    }
}

ReceiveComponent.defaultProps = { progress: '0', subtitle: 'Average speed is estimating' };

module.exports = ReceiveComponent;
