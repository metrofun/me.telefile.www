var WebSocket = require('ws'),
    ws = new WebSocket('ws://127.0.0.1:1111');

ws.on('open', function() {
    var array = new Float32Array(5);
    for (var i = 0; i < array.length; ++i) array[i] = i / 2;
    ws.send(array, {binary: true, mask: true});
});

module.exports = {
    createRoom: function() {
    },
    joinRoom: function (name) {
    }
};
