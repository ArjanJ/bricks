'use strict';

import autoprefixer from 'autoprefixer';
import babel from 'gulp-babel';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import cssnano from 'gulp-cssnano';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import rename from 'gulp-rename';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
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
	},
	css: {
		src: `${dirs.src}/css/*.scss`,
		build: `${dirs.build}/css`
	}
};

gulp.task('default', ['watch']);
gulp.task('watch', ['scripts', 'styles'], watch);
gulp.task('scripts', ['lint'], scripts);
gulp.task('lint', lint);
gulp.task('styles', styles);

function watch() {
	gulp.watch(paths.js.src, ['scripts', 'lint']);
	gulp.watch(paths.css.src, ['styles']);
}

function scripts() {
	const props = {
		entries: paths.js.exports,
		debug: true
	};

	return browserify(props)
		.transform(babelify)
		.bundle()
		.on('error', handleError)
		.pipe(source('Layout.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(gulp.dest(paths.js.build))
		.pipe(uglify())
		.pipe(rename('Layout.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.js.build));
}

function lint() {
	return gulp.src(paths.js.src)
		.pipe(eslint())
		.pipe(eslint.format());
}

function styles() {
	return gulp.src(paths.css.src)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', handleError)
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(rename('layout.css'))
		.pipe(gulp.dest(paths.css.build))
		.pipe(cssnano())
		.pipe(rename('layout.min.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.css.build))
}

function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}