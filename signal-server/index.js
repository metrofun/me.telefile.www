var app = require('koa')(),
    router = require('routes')(),
    cors = require('koa-cors'),
    DataStreamFrame = require('./reactive-transport-frame.js'),
    httpServer = require('http').createServer(app.callback()),
    sockjsServer = require('sockjs').createServer(),
    roomHub = require('./room-hub.js');

router.addRoute('/v1/room/create/*', function (stream) {
    var pin = roomHub.createRoom(stream);

    stream.write(DataStreamFrame.encode(1, {meta: {id: pin}}));
});
router.addRoute('/v1/room/:pin/*', function (stream, params) {
    roomHub.joinRoom(params.pin, stream);
});

app.use(cors());

sockjsServer.installHandlers(httpServer, {prefix: '[/]v1[/]room[/](?:create|[0-9]{6})'});
sockjsServer.on('connection', function (stream) {
    var match = router.match(stream.pathname);

    match.fn.apply(stream, [stream, match.params, match.splats]);
});

httpServer.listen(1111);
