var gulp = require('gulp'),
    less = require('gulp-less'),
    gutil = require('gulp-util'),
    replace = require('gulp-replace'),
    React = require('react'),
    symlink = require('gulp-symlink'),
    rename = require('gulp-rename'),
    ghPages = require("gulp-gh-pages"),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    mocha = require('gulp-mocha'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),

    SRC_DIR = './src',
    DEST_DIR = './dest';

require('node-jsx').install({extension: '.jsx'});

gulp.task('less', function () {
    return gulp.src(SRC_DIR + '/index.less')
        .pipe(less())
        .on('error', function () {
            this.emit('end');
            gutil.log.apply(this, arguments);
        })
        .pipe(gulp.dest(DEST_DIR))
        .pipe(livereload());
});

gulp.task('browserify', function () {
    var bundler = browserify(SRC_DIR + '/index.js');

    bundler.transform({es6: true}, reactify);

    function rebundle () {
        return bundler.bundle({debug: true})
            .on('error', function () {
                this.emit('end');
                gutil.log.apply(this, arguments);
            })
            .pipe(source('index.js'))
            .pipe(gulp.dest(DEST_DIR))
            .pipe(livereload());
    }

    gulp.task('browserify-rebundle', rebundle);

    gulp.watch([
        SRC_DIR + '/**/*.js',
        SRC_DIR + '/**/*.jsx'
    ], ['browserify-rebundle']);

    return rebundle();
});

gulp.task('watch', function () {
    gulp.watch(SRC_DIR + '/**/*.less', ['less']);
});

gulp.task('static-server', function (next) {
    var NodeServer = require('node-static'),
        server = new NodeServer.Server(DEST_DIR),
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

gulp.task('renderComponentToString', function(){
    return gulp.src(SRC_DIR + '/index.html')
        .pipe(replace(/<!-- renderComponentToString ([a-z0-9]+) -->/g, function (matched, componentName) {
            var component = require(SRC_DIR + '/components/' + componentName  + '.jsx');

            return React.renderComponentToString(component());
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(DEST_DIR));
});

gulp.task('development', function () {
    return gulp.src(SRC_DIR + '/config/development.js')
        .pipe(symlink(SRC_DIR + '/config/current.js'));
});

gulp.task('production', function () {
    return gulp.src(SRC_DIR + '/config/production.js')
        .pipe(symlink(SRC_DIR + '/config/current.js'));
});

gulp.task('uglify', ['browserify'], function () {
    return gulp.src(DEST_DIR + '/index.js')
        .pipe(uglify())
        .pipe(gulp.dest(DEST_DIR));
});

gulp.task('test', function () {
    gulp.src('tests/**/webrtc.test.js').pipe(mocha({
        bail: true,
        // reporter: 'dot',
        useColors: false
    }));
});

gulp.task('publish', [
    'production',
    'renderComponentToString',
    'less',
    'uglify'
], function () {
     return gulp.src(DEST_DIR + '/**/*').pipe(ghPages({
        cacheDir: '.gulp-gh-pages'
     }));
});

gulp.task('default', [
    'development',
    'renderComponentToString',
    'less',
    'browserify',
    'static-server',
    'watch'
]);
