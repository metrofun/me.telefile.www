var koa = require('koa'),
    app = koa(),
    http = require('http'),
    sockjs = require('sockjs'),
    httpServer = http.createServer(app.callback()),
    sockjsServer = sockjs.createServer(),
    cors = require('koa-cors');

app.use(cors());

sockjsServer.installHandlers(httpServer);

sockjsServer.on('connection', function (conn) {
    console.log(conn.meta);
    conn.on('data', function () {
        // console.log('data', arguments);
    });
    conn.on('close', function () {});
});

httpServer.listen(1111);
