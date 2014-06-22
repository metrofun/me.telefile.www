var gulp = require('gulp'),
    gutil = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

gulp.task('browserify', function () {
    var bundleStream = browserify('./src/index.js').bundle({
        debug: true
    });

    return bundleStream
        .on('error', gutil.log)
        .pipe(source('index.js'))
        .pipe(gulp.dest('public'));
});

gulp.task('watch', function () {
    var livereload = require('gulp-livereload'),
        server = livereload();

    gulp.watch('./src/**/*.js', ['browserify']).on('change', function (file) {
        server.changed(file.path);
    });
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
        watch: ['signal_server'],
        ext: 'js'
    });
});

gulp.task('default', ['browserify', 'static-server', 'signal-server', 'watch']);
