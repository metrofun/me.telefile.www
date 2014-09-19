var gulp = require('gulp'),
    less = require('gulp-less'),
    gutil = require('gulp-util'),
    replace = require('gulp-replace'),
    React = require('react'),
    symlink = require('gulp-symlink'),
    rename = require('gulp-rename'),
    ghPages = require("gulp-gh-pages"),
    uglify = require('gulp-uglify'),
    nodemon = require('gulp-nodemon'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream');

require('node-jsx').install({extension: '.jsx'});

gulp.task('less', function () {
    return gulp.src('./app/index.less')
        .pipe(less())
        .on('error', function () {
            this.emit('end');
            gutil.log.apply(this, arguments);
        })
        .pipe(gulp.dest('public'))
        .pipe(livereload());
});

gulp.task('browserify', function () {
    var bundler = browserify('./app/index.js');

    bundler.transform({es6: true}, reactify);

    function rebundle () {
        return bundler.bundle({debug: true})
            .on('error', function () {
                this.emit('end');
                gutil.log.apply(this, arguments);
            })
            .pipe(source('index.js'))
            .pipe(gulp.dest('public'))
            .pipe(livereload());
    }

    gulp.task('browserify-rebundle', rebundle);

    gulp.watch([
        './app/**/*.js',
        './app/**/*.jsx'
    ], ['browserify-rebundle']);

    return rebundle();
});

gulp.task('watch', function () {
    gulp.watch('./app/**/*.less', ['less']);
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
    return nodemon({
        script: 'signal-server/index.js',
        options: '--harmony',
        execMap: {
            js: 'node --harmony'
        },
        watch: ['signal-server'],
        ext: 'js'
    });
});

gulp.task('renderComponentToString', function(){
    return gulp.src('app/index.html')
        .pipe(replace(/<!-- renderComponentToString ([a-z0-9]+) -->/g, function (matched, componentName) {
            var component = require('./app/components/' + componentName  + '.jsx');

            return React.renderComponentToString(component());
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('public'));
});

gulp.task('development', function () {
    return gulp.src('app/config/development.js')
        .pipe(symlink('app/config/current.js'));
});

gulp.task('production', function () {
    return gulp.src('app/config/production.js')
        .pipe(symlink('app/config/current.js'));
});

gulp.task('uglify', ['browserify'], function () {
    return gulp.src('public/index.js')
        .pipe(uglify())
        .pipe(gulp.dest('public'));
});

gulp.task('publish', [
    'production',
    'renderComponentToString',
    'less',
    'uglify'
], function () {
     return gulp.src('public/**/*').pipe(ghPages());
});

gulp.task('default', [
    'development',
    'renderComponentToString',
    'less',
    'browserify',
    'static-server',
    'signal-server',
    'watch'
]);
