var React = require('react'),
    Rx = require('rx'),
    serialDisposable = new Rx.SerialDisposable(),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    pinStore = require('../../stores/pin.js'),
    actions = require('../../actions/actions.js');

class Button extends React.Component {
    componentWillMount() {
        this.setState(pinStore.getState());
        this._onKeyChange = this._onKeyChange.bind(this);
        this.reset_ = this.reset_.bind(this);

        serialDisposable.setDisposable(pinStore.subscribe((state) => this.setState(state)));
    }
    _onKeyChange(e) {
        if (e.keyCode === 27) {
            this.reset_();
        } else if (this.state.pin !== e.target.value) {
            dispatcher.onNext({
                type: actions.PIN_CHANGED,
                pin: e.target.value
            });
        }
    }
    reset_() {
        this.refs.input.getDOMNode().blur();
        dispatcher.onNext({
            type: actions.PIN_CHANGED,
            pin: ''
        });
    }
    render() {
        return <div className="button button_type_receive">
            {this.state.isValid && <div className="button__spinner"></div>}
            <input className="button__input"
                ref="input"
                onBlur={this.reset_}
                onKeyDown={this._onKeyChange}
                onChange={this._onKeyChange}
                autoComplete="off"
                value={this.state.pin}
                type="text" placeholder="INPUT PIN"/>
            <span className="button__text">RECEIVE</span>
        </div>;
    }
}

module.exports = Button;
