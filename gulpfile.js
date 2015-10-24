'use strict';

var SOURCE_DIR = 'src';
var BUILD_DIR = 'build';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');

gulp.task('build', function(){
  gulp.src(SOURCE_DIR + '/manifest.json')
    .pipe(gulp.dest(BUILD_DIR));
  gulp.src(SOURCE_DIR + '/lib/highlight.js')
    .pipe(gulp.dest(BUILD_DIR + '/lib'));
  gulp.src('node_modules/kuromoji/dist/dict/*')
    .pipe(gulp.dest(BUILD_DIR + '/dict'));

  // js
  browserify({entries: [SOURCE_DIR + '/js/boot.js']})
    .bundle()
    .pipe(source('boot.js'))
    .pipe(gulp.dest(BUILD_DIR + '/js'));
});

// clean
gulp.task('clean', function() {
  del(BUILD_DIR);
});

// watch src dir
gulp.task('watch', ['build'], function() {
  gulp.watch(SOURCE_DIR + '/js/*.js', ['build']);
  gulp.watch(SOURCE_DIR + '/lib/*.js', ['build']);
});

// default task
gulp.task('default', ['clean', 'watch']);
