var React = require('react'),
    Rx = require('rx'),
    serialDisposable = new Rx.SerialDisposable(),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    pinStore = require('../../stores/pin.js'),
    actions = require('../../actions/actions.js');

class Button extends React.Component {
    componentWillMount() {
        this.setState(pinStore.getState());
        this.onKeyDown_ = this.onKeyDown_.bind(this);

        serialDisposable.setDisposable(pinStore.subscribeOnNext(function(state) {
            this.setState(state);
        }, this));
    }
    onKeyDown_(e) {
        if (e.keyCode === 27) {
            this.refs.input.getDOMNode().blur();
        } else {
            dispatcher.onNext({
                type: actions.PIN_CHANGED,
                pin: e.target.value
            });
        }
    }
    render() {
        return <div className="button button_type_receive">
            <input className="button__input"
                onKeyDown={this.onKeyDown_}
                onChange={this.onKeyDown_}
                ref="input"
                value={this.state.pin}
                type="text" placeholder="INPUT PIN"/>
            <span className="button__label">RECEIVE</span>
        </div>;
    }
}

module.exports = Button;
