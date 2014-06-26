var SignalBus = require('./SignalBus.js');

function FileReceiver(fileId) {
    this.fileId = fileId;

    this.signalBus = new SignalBus(fileId);
}

module.exports = FileTunnel;
