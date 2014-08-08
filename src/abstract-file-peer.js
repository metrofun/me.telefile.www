var Rx = require('rx');

function AbstractFilePeer() {
    this._startTime = Date.now();
}
AbstractFilePeer.prototype = {
    getWebrtcSubject: function () {
        throw new Error('not implemented');
    },
    getMeta: function () {
        throw new Error('not implemented');
    },
    getProgress: function () {
        //skip frame containing encoded meta
        return this.getWebrtcSubject().skip(1).scan(0, function (sum, data) {
            return sum + data.byteLength;
        }).sample(500/* ms */).combineLatest(Rx.Observable.fromPromise(this.getMeta()), function (size, meta) {
            return size / meta.size * 100;
        });
    },
    getBps: function () {
        //skip frame containing encoded meta
        return Rx.Observable.combineLatest(
            this.getWebrtcSubject().take(1).map(function () {
                return Date.now();
            }),

            this.getWebrtcSubject().skip(1).scan(0, function (sum, data) {
                return sum + data.byteLength;
            }).sample(500/* ms */),

            function (startTime, sum) {
                return sum / (Date.now() - startTime) * 1000;
            }
        );
    }
};

module.exports = AbstractFilePeer;
