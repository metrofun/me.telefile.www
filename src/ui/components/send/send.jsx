var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js'),
    fileStore = require('../../stores/file.js'),
    optionsStore = require('../../stores/options.js'),
    Process = require('../process/process.jsx'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),
    Transfer = require('../transfer/transfer.jsx'),

    WAIT_MODE = 'wait mode',
    SEND_MODE = 'send mode',
    LINK_SHARE = 'link shareType',
    PIN_SHARE = 'pin shareType',
    WAITING_TIME_STEP = 1000,
    MAX_WAITING_TIME = 10 * 60;

class Send extends React.Component {
    componentWillMount() {
        this.copyUrl = this.copyUrl.bind(this);
        document.addEventListener('copy', this.copyUrl);

        var sender = fileStore.getState().sender,
            {send} = optionsStore.getState(),
            shareType = send && send.shareType;

        if (!shareType) {
            shareType = window.matchMedia('(orientation:landscape)').matches ?
                LINK_SHARE:PIN_SHARE;
        }

        this.setState({
            mode: WAIT_MODE,
            shareType,
            timeleft: MAX_WAITING_TIME
        });

        optionsStore.subscribeOnNext(({send}) => send && this.setState(send));

        sender.getPin().then(
            (pin) => {
                this.setState({ pin });
                // TODO potential memory lick, if unmounted before pin arrived
                this._intervalId = setInterval(this._waitingTick.bind(this), WAITING_TIME_STEP);
            },
            () => dispatcher.onNext({ type: actions.PIN_ERROR })
        );

        sender.getProgress().first().subscribe(() => {
            this.setState({ mode: SEND_MODE });
            this._clearWaitingTick();
        }, () => dispatcher.onNext({ type: actions.FILE_ERROR }));
    }
    componentWillUnmount() {
        document.removeEventListener('copy', this.copyUrl);
        this._clearWaitingTick();
    }
    copyUrl(e) {
        if ((this.state.shareType === LINK_SHARE)) {
            e.clipboardData.setData('text/plain', [
                document.location.protocol,
                '//telefile.me/g/',
                this.state.pin
            ].join(''));

            e.preventDefault();
        }
    }
    _selectTitle() {
        var text =  this.refs.title.getDOMNode(),
            range,
            selection;

        if(document.body.createTextRange){ //ms
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        }else if(window.getSelection){ //all others
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    _pad(value) {
        return value < 10 ? '0' + value:value;
    }
    /**
     * Format seconds to "mm:ss"
     * @param {number} seconds
     */
    _formatTimeleft(seconds) {
        return this._pad(Math.floor(seconds / 60) % 60) + ':' + this._pad(seconds % 60);
    }
    _waitingTick() {
        if (this.state.timeleft) {
            this.setState({timeleft: this.state.timeleft - 1});
        } else {
            dispatcher.onNext({ type: actions.FILE_SEND_TIMEOUT });
            this._clearWaitingTick();
        }
    }
    _clearWaitingTick() {
        clearInterval(this._intervalId);
    }
    _cancel() {
        dispatcher.onNext({ type: actions.RESET });
    }
    _toggleShareType() {
        dispatcher.onNext({
            type: actions.SEND_OPTIONS_CHANGED,
            options: {
                send: {
                    shareType: this.state.shareType === PIN_SHARE ? LINK_SHARE:PIN_SHARE
                }
            }
        });
    }
    _getLinkShareTitle() {
        return <span className="send__link">
            <span className="send__link-domain">telefile.me/g/</span>
            <span className="send__link-pin">{this.state.pin}</span>
        </span>;
    }
    render() {
        var title, subtitle, buttons;
        if (this.state.mode === WAIT_MODE) {
            if (this.state.pin) {
                if (this.state.shareType === LINK_SHARE) {
                    title = this._getLinkShareTitle();
                    subtitle = 'Link works only while this page is opened';
                } else if (this.state.shareType === PIN_SHARE) {
                    title = this.state.pin;
                    subtitle = 'copy above pin on another device';
                }
                buttons = [
                    <div
                        className={'send__button send__button_type_' + (this.state.shareType === LINK_SHARE ? 'pin':'link')}
                        role="button"
                        onClick={this._toggleShareType.bind(this)}
                        aria-label="switch pin or url"></div>,
                    <div className="send__button send__button_type_copy"
                        role="button"
                        onClick={this._selectTitle.bind(this)}
                        aria-label="copy pin or url"></div>
                ];
            } else {
                title = <span className="send__spinner">
                    {new Array(5).join(' ').split('').map(() => <span/>)}
                </span>;
            }
            return <div className="layout send">
                <div className="layout__title">Waiting for receiver</div>
                <div className="layout__main">
                    <Mobile />
                    <Process
                        progress={1 - this.state.timeleft / MAX_WAITING_TIME}
                        title={<span ref="title" > {title} </span>}
                        subtitle={subtitle}
                        footer={this._formatTimeleft(this.state.timeleft)}>
                        {buttons}
                    </Process>
                    <Desktop />
                </div>
                <div className="controls">
                    <Button onClick={this._cancel}>Cancel</Button>
                </div>
            </div>;
        } else if (this.state.mode === SEND_MODE) {
            return <Transfer source={fileStore.getState().sender}/>;
        }
    }
};

module.exports = Send;
