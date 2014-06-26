var gulp = require('gulp')
    connect = require('connect'),
    static = require('serve-static'),
    gutil = require('gulp-util'),
    http = require('http'),
    browserify = require('gulp-browserify'),
    watch = require('gulp-watch'),
    clean = require('gulp-rimraf'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat')

var build = function() {
  gulp.src('app.js')
    .pipe(browserify())
    .on('error', notify.onError("<%= error.message%>"))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./build'))
}

gulp.task('default', ['build'])

gulp.task('build', build)

gulp.task('serve', function() {
  var port = 3000

  var app = connect()
  app.use(static(__dirname))
  app.listen(port)
  gutil.log("Server listening on localhost:"+port+" ...")
})

gulp.task('watch', ['serve'], function() {
  gulp.src(['app.js', 'lib/*.js'])
    .pipe(watch(build))

})

gulp.task('clean', function() {
	gulp.src('./build', {read: false}).pipe(clean());
});
