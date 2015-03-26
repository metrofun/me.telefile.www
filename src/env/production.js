module.exports = {
    SIGNAL_SERVER: 'http://signal.telefile.me:80',
    IS_NODE: typeof global !== "undefined" &&
        Object.prototype.toString.call(global) === '[object global]'
};
