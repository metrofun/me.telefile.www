var koa = require('koa'),
    app = koa(),
    createRouter = require('routes'),
    router = createRouter(),
    http = require('http'),
    sockjs = require('sockjs'),
    httpServer = http.createServer(app.callback()),
    sockjsServer = sockjs.createServer(),
    cors = require('koa-cors');

router.addRoute('/v1/room/create/*', onRoomCreate);
router.addRoute('/v1/room/:roomNumber/*', onRoomJoin);

function onRoomCreate(transmitter) {
}
function onRoomJoin(receiver, params) {
    console.log(params.roomNumber);
}

app.use(cors());

sockjsServer.installHandlers(httpServer, {prefix: '[/]v1[/]room[/](?:create|[a-zA-Z0-9]{8})'});
sockjsServer.on('connection', function (stream) {
    var match = router.match(stream.pathname);

    match.fn.apply(stream, [stream, match.params, match.splats]);
});

httpServer.listen(1111);
