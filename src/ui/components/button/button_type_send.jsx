var React = require('react'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js');

class Button extends React.Component {
    onFileSelect_(e) {
        var file = e.target.files[0];

        dispatcher.onNext({
            type: actions.FILE_SEND,
            file: file
        });
    }
    render() {
        return <div className="button button_type_send">
            <label className="button__label">
                SEND
                <input onChange={this.onFileSelect_} className="button__input" type="file" />
            </label>
            <label className="button__icon">
                <input onChange={this.onFileSelect_} className="button__input" type="file" accept="image/*;capture=camera" />
            </label>
        </div>;
    }
}

module.exports = Button;
