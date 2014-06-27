var koa = require('koa'),
    app = koa(),
    http = require('http'),
    server = http.createServer(app.callback()),
    sockjs = require('sockjs'),
    cors = require('koa-cors');

app.use(cors());

sockjs.createServer().installHandlers(server);

server.listen(1111);
