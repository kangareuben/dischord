var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    babel  = require('gulp-babel')

gulp.task( 'js', function() {
  gulp.src( 'dischord.js' )
    .pipe( babel({ presets:['es2015'] }) )
    .pipe( uglify() )
    .pipe( 
      rename( function( path ) {
        path.basename += '.min'
      }) 
    )
    .pipe( gulp.dest('./dist') )
    .pipe( 
      notify({ 
        message:'Build has been completed',
        onLast:true
      }) 
    )
})

gulp.task( 'watch', function() {
  gulp.watch( 'dischord.js', function() {
    gulp.run( 'js' )
  })
})

gulp.task( 'default', ['watch'] )
