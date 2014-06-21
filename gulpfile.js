var gulp = require('gulp'),
    streamify = require('gulp-streamify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

gulp.task('browserify', function () {
    var root = './src/index.js',
        bundleStream = browserify(root).bundle({
            debug: true
        });

    bundleStream
        .pipe(source('app.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['browserify']);
});

gulp.task('default', ['browserify', 'watch']);
