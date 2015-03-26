require('./debug');
module.exports = {
    SIGNAL_SERVER: 'http://127.0.0.1:8888',
    IS_NODE: typeof global !== "undefined" &&
        Object.prototype.toString.call(global) === '[object global]'
};
