var React = require('react'),
    Button = require('../button/button.jsx'),
    Mobile = require('../mobile/mobile.jsx'),
    Desktop = require('../desktop/desktop.jsx'),
    dispatcher = require('../../dispatcher/dispatcher.js'),
    actions = require('../../actions/actions.js');

class Completed extends React.Component {
    _cancel() {
        dispatcher.onNext({ type: actions.FILE_TRANSFER_CANCEL });
    }
    _formatSize(bytes) {
        if(bytes === 0) {
            return '0 Byte';
        }
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(2) + ' ' + sizes[i];
    }
    render() {
        var tokens = this.props.meta.name.split('.'),
            filename, extension;

        if (tokens.length > 1) {
            extension = tokens.pop().substr(0, 3);
            filename = tokens.join('');
        } else {
            extension = '';
            filename = this.props.meta.name;
        }

        return <div className="layout completed">
            <div className="layout__title">Transfer completed!</div>
            <div className="completed__caption">Completed</div>
            <div className="layout__main">
                <Mobile />
                <div className="file-list">
                    <div className="file-list__item">
                        <div className="file-list__icon">
                            <span className="file-list__icon-text">{extension}</span>
                        </div>
                        <a className="file-list__title"
                            download={this.props.meta.name}
                            href={window.URL.createObjectURL(this.props.blob)}>
                            {filename}
                        </a>
                        <div className="file-list__subtitle">
                            {this._formatSize(this.props.blob.size)}
                        </div>
                        <a className="file-list__action"
                            download={this.props.meta.name}
                            href={window.URL.createObjectURL(this.props.blob)}>
                        </a>
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

Completed.defaultProps = {
    meta: {
        name: 'test name'
    },
    blob: new Blob([123, 123, 123])
};



module.exports = Completed;
