var gulp = require('gulp'),
    less = require('gulp-less'),
    gutil = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream');

gulp.task('less', function () {
    gulp.src('./less/**/*.less')
        .pipe(less())
        .on('error', function () {
            this.emit('end');
            gutil.log.apply(this, arguments);
        })
        .pipe(gulp.dest('public'))
        .pipe(livereload());
});

gulp.task('browserify', function () {
    var bundler = browserify('./src/index.js');

    bundler.transform({es6: true}, reactify);

    function rebundle () {
        console.log('rebundle');
        return bundler.bundle({debug: true})
            .on('error', function () {
                this.emit('end');
                gutil.log.apply(this, arguments);
            })
            .pipe(source('index.js'))
            .pipe(gulp.dest('public'))
            .pipe(livereload());
    }

    bundler.on('update', rebundle);

    gulp.watch([
        './src/**/*.js',
        './src/**/*.jsx'
    ], rebundle);

    return rebundle();
});

gulp.task('watch', function () {
    gulp.watch('./less/**/*.less', ['less']);
    gulp.watch('./public/index.html', function () {
        livereload();
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
        options: '--harmony',
        execMap: {
            js: 'node --harmony'
        },
        watch: ['signal_server'],
        ext: 'js'
    });
});

gulp.task('default', ['less', 'browserify', 'static-server', 'signal-server', 'watch']);
