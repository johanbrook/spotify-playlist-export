var gulp = require('gulp')
    connect = require('connect'),
    static = require('serve-static'),
    gutil = require('gulp-util'),
    http = require('http'),
    browserify = require('gulp-browserify'),
    watch = require('gulp-watch'),
    clean = require('gulp-rimraf'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    rev = require('gulp-rev'),
    compress = require('gulp-uglify'),
    mocha = require('gulp-mocha')

var build = function() {
  gulp.src('app.js')
    .pipe(browserify())
    .on('error', notify.onError("<%= error.message%>"))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./build'))
}

var testAll = function() {
  gulp.src(['tests/*.js'], { read: false })
    .pipe(mocha({
      globals: ['should'],
      reporter: 'spec'
    }))
    .on('error', notify.onError("<%= error.message%>"))
}

gulp.task('default', ['build'])

gulp.task('build', build)

gulp.task('dist', ['clean:dist'], function() {
  gulp.src('app.js')
    .pipe(browserify())
    .pipe(concat('spotify-export.min.js'))
    .pipe(rev())
    .pipe(compress())
    .pipe(gulp.dest('./dist'))
})

gulp.task('serve', function() {
  var port = 3000

  var app = connect()
  app.use(static(__dirname))
  app.listen(port)
  gutil.log("Server listening on localhost:"+port+" ...")
})

gulp.task('watch', ['serve'], function() {
  var files = gulp.src(['app.js', 'lib/*.js'])

  files.pipe(watch(build))
  files.pipe(watch(testAll))

})

gulp.task('test', function() {
  testAll()
})

gulp.task('clean', ['clean:build', 'clean:dist'])

gulp.task('clean:build', function() {
	gulp.src('./build', {read: false}).pipe(clean());
});

gulp.task('clean:dist', function() {
  gulp.src('./dist', {read: false}).pipe(clean());
});
