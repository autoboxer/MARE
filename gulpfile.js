var gulp 			= require('gulp'),
	jshint 			= require('gulp-jshint'),
	jscs 			= require('gulp-jscs'),
	jshintReporter 	= require('jshint-stylish'),
	watch 			= require('gulp-watch');
	browserify 		= require('browserify');

/*
 * Create variables for our project paths so we can change in one place
 */
var paths = {
	'src':['./models/**/*.js','./routes/**/*.js', 'keystone.js', 'package.json']
};


// gulp lint
gulp.task( 'lint', function() {
	gulp.src(paths.src)
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));

});

// gulp jscs
gulp.task('jscs'), function() {
	gulp.src('src/mare.json')
		.pipe(jscs());
}

// gulp watcher for lint
gulp.task('watch:lint', function () {
	gulp.src(paths.src)
		.pipe(watch())
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));
});

// tasks for concatenating, minifying, and adding CommonJS functionality via Browserify
gulp.task('scripts', function() {
    // Single entry point to browserify 
    gulp.src('src/js/app.js')
        .pipe(browserify({
          insertGlobals : true,
          debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./build/js'))
});
