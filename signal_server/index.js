var koa = require('koa'),
    app = koa(),
    createRouter = require('routes'),
    router = createRouter(),
    http = require('http'),
    sockjs = require('sockjs'),
    httpServer = http.createServer(app.callback()),
    sockjsServer = sockjs.createServer(),
    cors = require('koa-cors'),

    rooms = require('./rooms.js');

router.addRoute('/v1/room/create/*', function (stream) {
    var roomHash = rooms.create(stream);

    stream.write(roomHash);
    console.log('write', roomHash);
});
router.addRoute('/v1/room/:roomHash/*', function (stream, params) {
    rooms.join(stream, params.roomHash);
});

app.use(cors());

sockjsServer.installHandlers(httpServer, {prefix: '[/]v1[/]room[/](?:create|[a-zA-Z0-9]{8})'});
sockjsServer.on('connection', function (stream) {
    var match = router.match(stream.pathname);

    match.fn.apply(stream, [stream, match.params, match.splats]);
});

httpServer.listen(1111);
