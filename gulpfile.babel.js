'use strict';

import babel from 'gulp-babel';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

const dirs = {
	src: './src',
	build: './build'
};

const paths = {
	js: {
		exports: `${dirs.src}/js/exports.js`,
		src: `${dirs.src}/js/*.js`,
		build: `${dirs.build}/js`
	}
};

gulp.task('default', ['watch']);
gulp.task('watch', ['scripts'], watch);
gulp.task('scripts', scripts);

function watch() {
	gulp.watch(paths.js.src, ['scripts']);
}

function scripts() {
	const props = {
		entries: paths.js.exports,
		debug: true
	};

	return browserify(props)
		.transform(babelify)
		.bundle()
		.on('error', function(err) { console.error(err); this.emit('end'); })
		.pipe(source('Layout.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(gulp.dest(paths.js.build))
		.pipe(uglify())
		.pipe(rename('Layout.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.js.build));
}