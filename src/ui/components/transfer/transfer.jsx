var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    Process = require('../process/process.jsx'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx');

class TransferComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;
    }
    componentWillMount() {
        var source = this.props.source;

        source.getProgress().subscribeOnNext((progress) => this.setState({ progress }));
        source.getBps().subscribeOnNext((Bps) => {
            this.setState({
                subtitle: 'Average speed is ' + this._BpsToHuman(Bps)
            });
        });
    }
    /**
     * Converts bytes-per-second to human readable format
     * @param {number} Bps
     */
    _BpsToHuman(Bps) {
        if (Bps < 1024) {
            return Math.round(Bps) + 'Bps';
        } else if (Bps < 1024 * 1024) {
            return Math.round(Bps / 1024) + 'KBps';
        } else {
            return (Bps / 1024 / 1025).toFixed(1) + 'MBps';
        }
    }
    /**
     * Formats raw progress value
     * @param {number} progress Number value from 0 to 100
     */
    _formatProgress(progress) {
        return Number(progress).toFixed(Number(progress < 10));
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
                    title={this._formatProgress(this.state.progress) + '%'}
                    subtitle={this.state.subtitle}
                    footer="01:22"
                />
                <Desktop />
            </div>
            <div className="controls">
                <Button onClick={this._cancel}>Cancel</Button>
            </div>
        </div>;
    }
}

TransferComponent.defaultProps = { progress: '0', subtitle: 'Average speed is estimating' };

module.exports = TransferComponent;
