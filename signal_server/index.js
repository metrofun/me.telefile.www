var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 1111});

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('message', message);
    });
    ws.send('something');
});
