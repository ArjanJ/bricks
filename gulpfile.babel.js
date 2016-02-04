'use strict';

import autoprefixer from 'autoprefixer';
import babel from 'gulp-babel';
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
	build: './build',
	lib: './lib'
};

const paths = {
	js: {
		exports: `${dirs.lib}/exports.js`,
		src: `${dirs.src}/js/*.js`,
		build: `${dirs.build}/js`,
		lib: dirs.lib
	},
	css: {
		src: `${dirs.src}/css/*.scss`,
		build: `${dirs.build}/css`
	}
};

gulp.task('default', ['watch', 'compileJS', 'packageJS', 'styles']);
gulp.task('watch', watch);
gulp.task('compileJS', compileJS);
gulp.task('packageJS', ['compileJS', 'lint'], packageJS);
gulp.task('lint', lint);
gulp.task('styles', styles);

function watch() {
	gulp.watch(paths.js.src, ['lint', 'compileJS', 'packageJS']);
	gulp.watch(paths.css.src, ['styles']);
}

function compileJS() {
	return gulp.src(paths.js.src)
		.pipe(babel())
		.on('error', handleError)
		.pipe(gulp.dest(paths.js.lib));
}

function packageJS() {
	const props = {
		entries: paths.js.exports,
		debug: true
	};

	return browserify(props)
		.bundle()
		.on('error', handleError)
		.pipe(source('bricks.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
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
		.pipe(rename('bricks.css'))
		.pipe(gulp.dest(paths.css.build))
		.pipe(cssnano())
		.pipe(rename('bricks.min.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.css.build))
}

function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}