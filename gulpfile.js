var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),

    DEST = './build';

gulp.task('browserify', function () {
    var bundleStream = browserify('./src/index.js').bundle({
        debug: true
    });

    return bundleStream
        .on('error', gutil.log)
        .pipe(source('app.js'))
        .pipe(gulp.dest(DEST));
});

gulp.task('server', function (next) {
    var NodeServer = require('node-static'),
        server = new NodeServer.Server(DEST),
        port = 8080;

    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response);
        }).resume();
    }).listen(port, function () {
        console.log('Server listening on port: ' + port);
        next();
    });
});

gulp.task('watch', function () {
    var livereload = require('gulp-livereload'),
        server = livereload();

    gulp.watch('src/**/*.js', ['browserify']).on('change', function (file) {
        server.changed(file.path);
    });

});

gulp.task('default', ['browserify', 'server', 'watch']);
