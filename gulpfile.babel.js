'use strict';

import autoprefixer from 'autoprefixer';
import babel from 'gulp-babel';
import browserify from 'browserify';
import browserSync from 'browser-sync';
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

const bs = browserSync.create();

const dirs = {
	src: './src',
	build: './build',
	lib: './lib',
	docs: './docs'
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
		build: `${dirs.build}/css`,
		docs: `${dirs.docs}/*.scss`
	}
};

gulp.task('default', ['serve', 'watch', 'compileJS', 'packageJS', 'styles', 'docStyles']);

gulp.task('serve', serve);

gulp.task('watch', watch);

gulp.task('compileJS', compileJS);

gulp.task('packageJS', ['compileJS', 'lint'], packageJS);
gulp.task('lint', lint);

gulp.task('styles', styles);

gulp.task('docStyles', ['styles'], docStyles);

function serve() {
	bs.init({
		server: {
			baseDir: '.'
		},
		open: false,
		notify: false
	});
}

function watch() {
	gulp.watch(paths.js.src, ['lint', 'compileJS', 'packageJS']);
	gulp.watch(paths.css.src, ['styles']);
	gulp.watch(paths.css.docs, ['docStyles']);
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
		.pipe(bs.stream());
}

function docStyles() {
	return gulp.src(paths.css.docs)
		.pipe(sass())
		.on('error', handleError)
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(cssnano())
		.pipe(gulp.dest(dirs.docs))
		.pipe(bs.stream());
}

function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}