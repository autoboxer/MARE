var gulp 			= require('gulp'),
	jshint 			= require('gulp-jshint'),
	jscs 			= require('gulp-jscs'),
	jshintReporter 	= require('jshint-stylish'),
	watch 			= require('gulp-watch'),
	browserify 		= require('browserify'),
	sass 			= require('gulp-sass'),
	concat 			= require('gulp-concat'),
	rename			= require('gulp-rename'),
	uglify			= require('gulp-uglify'),
	minify			= require('gulp-minify-css');
//	imagemin		= require('gulp-imagemin');

/*
 * Create variables for our project paths so we can change in one place
 */
var paths = {
	'src':[
		'./models/**/*.js',
		'./routes/**/*.js', 
		'keystone.js', 
		'package.json'],
	'css':[
		'public/styles/**/*.scss',
		'public/modules/**/*.css']
};

// Styles Task
gulp.task('styles', function() {
	return gulp.src(paths.css)
	.pipe(sass())
	.on('error', function(err) { console.error('Error!', err.message); })
	.pipe(concat('mare.css'))
	.pipe(gulp.dest('public/dist'))
	.pipe(minify({compatibility: 'ie8'}))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('public/dist'));
});


// gulp lint
gulp.task( 'lint', function() {
	gulp.src(paths.src)
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));

});

// gulp jscs
// TODO: need to adjust src to minified, concatenated js file
gulp.task('jscs'), function() {
	gulp.src('src/mare.json')
		.pipe(jscs());
}

// gulp watcher for lint
gulp.task('watch:lint', function () {
	gulp.src(paths.src)
		.pipe(watch(paths.src))
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));
});

gulp.task('default', ['styles']);







