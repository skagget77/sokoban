/*
 * Sokoban, a web version of the classic Sokoban puzzle game.
 * Copyright (C) 2017  Johan Andersson
 *
 * This file is part of Sokoban.
 *
 * Sokoban is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Sokoban is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Sokoban.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

var gulp       = require('gulp');
var autoPrefix = require('gulp-autoprefixer')
var babel      = require('gulp-babel');
var browserify = require('gulp-browserify');
var cleanCss   = require('gulp-clean-css');
var htmlMin    = require('gulp-htmlmin');
var jshint     = require('gulp-jshint');
var less       = require('gulp-less');
var minify     = require('gulp-minify');
var mustache   = require('gulp-mustache');
var phantomJs  = require('gulp-mocha-phantomjs');
var rename     = require('gulp-rename');
var uglify     = require('gulp-uglify');

// JS tasks.
gulp.task('js-lint', () => {
    return gulp.src('client/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

gulp.task('js-lint-test', () => {
    return gulp.src('test/client/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

gulp.task('js-transpile', ['js-lint'], () => {
    return gulp.src('client/index.js')
    	.pipe(babel({ presets: ['env'] }))
        .pipe(browserify({ insertGlobals: true }))
        .pipe(rename('sokoban.js'))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('js-transpile-test', ['js-lint-test'], () => {
    return gulp.src('test/client/index.js')
	.pipe(babel({ presets: ['env'] }))
        .pipe(browserify({ insertGlobals: true }))
        .pipe(rename('sokoban-test.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('js-min', ['js-transpile'], () => {
    return gulp.src('build/sokoban.js')
        .pipe(uglify())
        .pipe(rename('sokoban.min.js'))
        .pipe(gulp.dest('public/js'));
});

// CSS tasks.
gulp.task('css-transpile', () => {
    return gulp.src('client/less/index.less')
        .pipe(less())
        .pipe(autoPrefix({ cascade: true }))
        .pipe(rename('sokoban.css'))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('css-min', ['css-transpile'], () => {
    return gulp.src('build/sokoban.css')
        .pipe(cleanCss())
        .pipe(rename('sokoban.min.css'))
        .pipe(gulp.dest('public/css'));
});

// HTML tasks.
gulp.task('html-instantiate', () => {
    return gulp.src('client/index.tmpl')
	.pipe(mustache({ file: 'sokoban.js' }))
	.pipe(rename('index.html'))
	.pipe(gulp.dest('build'))
	.pipe(gulp.dest('public'))
});

gulp.task('html-min', ['html-instantiate'], () => {
    return gulp.src('client/index.tmpl')
	.pipe(mustache({ file: 'sokoban.min.js' }))
    	.pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
	.pipe(rename('index.min.html'))
	.pipe(gulp.dest('public'))
});

// Test tasks.
gulp.task('test', ['js-transpile', 'js-transpile-test'], () => {
    return gulp.src('test/client/index.html')
        .pipe(phantomJs());
});

// Other tasks.
gulp.task('build', ['test', 'js-min', 'css-min', 'html-min']);

gulp.task('watch', () => {
    gulp.watch('client/**/*.js', ['js-transpile']);
    gulp.watch('test/client/**/*.js', ['js-transpile-test']);
});

gulp.task('default', ['build', 'watch']);
