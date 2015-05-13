var gulp = require('gulp'),
    map = require('map-stream'),
    less = require('gulp-less'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    React = require('react'),
    del = require('delete'),
    replace = require('gulp-replace'),
    symlink = require('gulp-symlink'),
    rename = require('gulp-rename'),
    ghPages = require("gulp-gh-pages"),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    babelify = require("babelify"),
    reactify = require('reactify'),
    watchify = require('watchify'),
    mocha = require('gulp-mocha'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]}),

    SRC_DIR = './src',
    SITE_DIR = './site';

require('node-jsx').install({extension: '.jsx'});
require("babel/register");

gulp.task('less', function () {
    return gulp.src([
            SITE_DIR + '/_index.less',
            SRC_DIR + '/ui/components/**/*.less'
        ])
        .pipe(concat('index.less'))
        .pipe(less({
            ieCompat: false,
            plugins: [autoprefix]
        }))
        .on('error', function (e) {
            gutil.log(e);
            this.emit('end');
        })
        .pipe(gulp.dest(SITE_DIR))
        .pipe(livereload());
});

gulp.task('js', function () {
    watchify.args.debug = true;
    var bundler = watchify(browserify(watchify.args));

    bundler.add(SITE_DIR + '/_index.js');
    bundler.transform(reactify).transform(babelify);

    gulp.task('js-rebundle', rebundle);
    bundler.on('update', rebundle); // on any dep update, runs the bundler
    bundler.on('log', gutil.log); // output build logs to terminal

    function rebundle () {
        return bundler.bundle()
            // log errors if they happen
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('index.js'))
            // optional, remove if you don't want sourcemaps
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
            .pipe(sourcemaps.write('./')) // writes .map file
            //
            .pipe(gulp.dest(SITE_DIR))
            .pipe(livereload());
    }

    return rebundle();
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch([
        SRC_DIR + '/**/*.less',
        SRC_DIR + '/ui/components/**/*.less'
    ], ['less']);
    gulp.watch(SITE_DIR + '/**/_*.html.js', ['renderStaticPages']);
});

gulp.task('static-server', function (next) {
    var NodeServer = require('node-static'),
        server = new NodeServer.Server(SITE_DIR),
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

gulp.task('renderStaticPages', function(){
    return gulp.src(SITE_DIR + '/**/_*.html.js')
        .pipe(map(function(file, cb) {
            file.contents = new Buffer(require(file.path));
            file.path = file.base + '/' + file.relative.replace(/_(.+)\.html.js/, '$1.html');
            cb(null, file);
        }))
        .pipe(gulp.dest(SITE_DIR))
        .pipe(livereload());
});

gulp.task('development', function () {
    del.sync(SRC_DIR + '/env/current.js');

    return gulp.src(SRC_DIR + '/env/development.js')
        .pipe(symlink(SRC_DIR + '/env/current.js', {force: true}));
});

gulp.task('production', function () {
    del.sync(SRC_DIR + '/env/current.js');

    return gulp.src(SRC_DIR + '/env/production.js')
        .pipe(symlink(SRC_DIR + '/env/current.js', {force: true}));
});

gulp.task('uglify', ['js'], function () {
    return gulp.src(SITE_DIR + '/index.js')
        .pipe(uglify())
        .pipe(gulp.dest(SITE_DIR));
});

gulp.task('test', function () {
    gulp.src('tests/**/*.test.js').pipe(mocha({
        // grep: 'bufferedAmount',
        bail: true,
        // reporter: 'dot',
        useColors: false
    }));
});

gulp.task('publish', [
    'renderStaticPages',
    'less',
    'js',
    'uglify'
], function () {
     return gulp.src(SITE_DIR + '/**/*').pipe(ghPages({
        cacheDir: '.gulp-gh-pages'
     }));
});

gulp.task('default', [
    'renderStaticPages',
    'less',
    'js',
    'static-server',
    'watch'
]);
