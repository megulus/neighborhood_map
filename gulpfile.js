var gulp = require('gulp'),
    minifyhtml = require('gulp-htmlmin'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify');



function errorLog(error) {
    console.error.bind(error);
    this.emit('end');
}



gulp.task('html', function () {
    gulp.src('*.html')
        .pipe(minifyhtml({collapseWhitespace: true}))
        .pipe(gulp.dest('build'))
        .on('error', errorLog);
});


gulp.task('minifycss', function () {
    gulp.src('css/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('build/css'))
        .on('error', errorLog);
});

gulp.task('uglify', function () {
    gulp.src('js/*js')
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
        .on('error', errorLog)
});







gulp.task('default', ['html', 'minifycss', 'uglify']);