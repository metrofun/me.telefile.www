var gulp = require('gulp'),
    gutil = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    browserify = require('browserify'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream');

gulp.task('browserify', function () {
    var bundleStream = browserify('./src/index.js').bundle({
        // debug: true
    });

    return bundleStream
        .on('error', gutil.log)
        .pipe(source('index.js'))
        .pipe(gulp.dest('public'))
        .pipe(livereload());
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*.js', ['browserify']);
});

gulp.task('static-server', function (next) {
    var NodeServer = require('node-static'),
        server = new NodeServer.Server('./public'),
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

gulp.task('signal-server', function () {
    nodemon({
        script: 'signal_server/index.js',
        options: '--harmony',
        execMap: {
            js: 'node --harmony'
        },
        watch: ['signal_server'],
        ext: 'js'
    });
});

gulp.task('default', ['browserify', 'static-server', 'signal-server', 'watch']);
