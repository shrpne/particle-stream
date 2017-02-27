// common
const gulp = require('gulp');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
// js
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const gutil = require('gulp-util');



const dir = '';

// JS
const srcJs = [dir + 'js/**/*.js', '!' + dir + 'js/**/*.min.js'];
gulp.task("scripts", function() {
    return gulp.src(dir + 'js/Main.js')
        .pipe(plumber({errorHandler: onError}))
        .pipe(webpackStream(require('./webpack.config.js'), webpack))
        .pipe(gulp.dest(dir + 'js'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dir + 'js'));
});


// DEFAULT
gulp.task('default', ['scripts'], function() {
    gulp.watch(srcJs, ['scripts']);
});



// Ошибки
function onError(error) {
    gutil.log([
        (error.name + ' in ' + error.plugin).bold.red,
        '',
        error.message,
        ''
    ].join('\n'));
    gutil.beep();
    this.emit('end');
}











