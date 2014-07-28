var React = require('react/addons'),
    cx = React.addons.classSet,
    pinStore = require('../stores/pin-store.js');

module.exports = React.createClass({
    getInitialState: function () {
        return ({
            showInput: false,
        }, pinStore);
    },
    showAndFocusInput: function () {
        this.setState({showInput: true}, function () {
            this.refs.input.getDOMNode().focus();
        });
    },
    hideInput: function () {
        this.setState({showInput: false});
        pinStore.onNext({pin: ''});
    },
    onKeyDown: function (e) {
        if (e.keyCode == 27) {
            this.hideInput();
        } else {
            pinStore.onNext({pin: e.target.value});
        }
    },
    componentDidMount: function() {
        this.subscription = pinStore.subscribe(function (pinStore) {
            this.setState(pinStore);
        }.bind(this));
    },
    componentWillUnmount: function() {
        this.subscription.dispose();
    },
    render: function () {
        var content, classes = {
            'pin-form': true,
            'pin-form_valid_no': !this.state.pinIsValid && this.state.pin,
            'pin-form_valid_yes': this.state.pinIsValid
        };
        classes[this.props.className] = true;

        if (this.state.showInput) {
            content = <input
                ref="input"
                className="pin-form__input"
                onBlur={this.hideInput}
                onKeyDown={this.onKeyDown}
                onChange={this.onKeyDown}
                value={this.state.pin}
                placeholder="INPUT PIN"/>;
        } else {
            content = <span className="pin-form__button">receive</span>;
        }

        return (
            <div
                onClick={this.showAndFocusInput}
                className={ cx(classes) }>
                { content }
            </div>
        );
    }
});
