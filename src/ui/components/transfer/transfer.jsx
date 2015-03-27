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
        source.getMeta().then((meta) => {
            source.getBps().subscribeOnNext((Bps) => {
                this.setState({
                    subtitle: 'Average speed is ' + this._BpsToHuman(Bps),
                    footer: this._formatTimeleft(meta.size / Bps * (100 - this.state.progress) / 100) + ' left'
                });
            });
        });
    }
    _pad(value) {
        return value < 10 ? '0' + value:value;
    }
    /**
     * Format seconds to "hh:mm:ss"
     * @param {number} time in seconds
     */
    _formatTimeleft(time) {
        var ss, mm, hh;

        time = Math.floor(time);
        ss = this._pad(time % 60);
        time = Math.floor(time / 60);
        mm = this._pad(time % 60);
        time = Math.floor(time / 60);
        if (time) {
            hh = this._pad(time % 60);
            if (hh > 24) {
                return '∞';
            }
        }

        return [hh, mm, ss].filter(Boolean).join(':');
    }

    /**
     * Converts bytes-per-second to human readable format
     * @param {number} Bps
     */
    _BpsToHuman(Bps) {
        if (Bps < 1024) {
            return Math.round(Bps * 8) + 'bit/s';
        } else if (Bps < 1024 * 1024) {
            return Math.round(Bps / 1024 * 8) + 'kbit/s';
        } else {
            return (Bps / 1024 / 1024 * 8).toFixed(1) + 'Mbit/s';
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
                    footer={this.state.footer}
                />
                <Desktop />
            </div>
            <div className="controls">
                <Button onClick={this._cancel}>Cancel</Button>
            </div>
        </div>;
    }
}

TransferComponent.defaultProps = { progress: '0', subtitle: 'Average speed is estimating', footer: '' };

module.exports = TransferComponent;
