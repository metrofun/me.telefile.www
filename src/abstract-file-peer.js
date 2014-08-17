var Rx = require('rx');

function AbstractFilePeer() {
}
AbstractFilePeer.prototype = {
    getWebrtcSubject: function () {
        throw new Error('not implemented');
    },
    getMeta: function () {
        throw new Error('not implemented');
    },
    getProgress: function () {
        if (!this._progress) {
            //skip frame containing encoded meta
            this._progress = this.getWebrtcSubject().skip(1).scan(0, function (sum, data) {
                return sum + data.byteLength;
            }).sample(500/* ms */).combineLatest(Rx.Observable.fromPromise(this.getMeta()), function (size, meta) {
                return size / meta.size * 100;
            }).shareReplay(1);
        }
        return this._progress;
    },
    getBps: function () {
        if (!this._Bps) {
            this._Bps = Rx.Observable.combineLatest(
                this.getWebrtcSubject().take(1).map(function () {
                    return Date.now();
                }),
                //skip frame containing encoded meta
                this.getWebrtcSubject().skip(1).scan(0, function (sum, data) {
                    return sum + data.byteLength;
                }).sample(500/* ms */),
                function (startTime, sum) {
                    return sum / (Date.now() - startTime) * 1000;
                }
            ).shareReplay(1);
        }
        return this._Bps;
    }
};

module.exports = AbstractFilePeer;
