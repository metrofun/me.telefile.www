module.exports = {
    /**
     * Converts bytes-per-second to human readable format
     * @param {number} Bps
     */
    BpsToHuman: function(Bps) {
        if (Bps < 1024) {
            return Math.round(Bps) + 'Bps';
        } else if (Bps < 1024 * 1024) {
            return Math.round(Bps / 1024) + 'KBps';
        } else {
            return (Bps / 1024 / 1025).toFixed(1) + 'MBps';
        }
    },
    /**
     * Formats raw progress value
     * @param {number} progress Number value from 0 to 100
     */
    formatProgress: function(progress) {
        return Number(progress).toFixed(Number(progress < 10));
    }
};
