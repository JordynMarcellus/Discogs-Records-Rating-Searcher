//TODO--add proper notify onError funcs!

//top-level gulp stuff
var gulp = require('gulp');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber')

//css processing
var stylus = require('gulp-stylus');
var rupture = require('rupture');
var rucksack = require('gulp-rucksack');
var cssnano = require('gulp-cssnano');
var concatCSS = require('gulp-concat-css');
var nib = require('nib');
var axis = require('axis')
//postCSS modules
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var lost = require('lost');

//html processing
var pug = require('gulp-pug');

//js processing
var uglify = require('gulp-uglify');

//browser-sync
var browser_sync = require('browser-sync');
var reload = browser_sync.reload;

//images
var imagemin = require ('gulp-imagemin');

//process our styles
gulp.task('styles', function() {
    return gulp.src('src/css/*.styl')
        .pipe(stylus({
             use: [nib(), axis(), rupture()]
           }))
        .pipe( postcss([
            lost(),
            autoprefixer({browsers: ['last 2 versions']}),
        ]))
        .pipe( rucksack() )
        .pipe( concatCSS('bundle.css') )
        .pipe( cssnano() )
        .pipe(notify("CSS good to go!"))
        .pipe( gulp.dest('build/css/') )
});

//do the browser_sync thing
gulp.task('browser_sync', function() {
    browser_sync({
        server: { baseDir: './build/'}
    });
});

//compiles the pug template(s) to HTML
gulp.task('compile_html', function() {
    return gulp.src('src/html/*.pug')
        .pipe( pug() )
        .pipe( gulp.dest('./build/'))
        .pipe( notify("HTML compiled!") )
        .pipe( reload({stream:true}) );
});

//pug-watch needs compile_html to be a dependency for the reload to work when editing everything
gulp.task('pug-watch', ['compile_html'], reload);

//watch, style and reload 
gulp.task('watch', function() {
    gulp.watch('src/html/*.pug', ['compile_html']);
    gulp.watch('src/css/*.styl', ['styles']);
    gulp.watch('src/js/*.js', ['minify']);
    gulp.watch('./build/*js', reload)
    gulp.watch('./build/*.html', reload)
    gulp.watch('./build/css/*.css', reload);
});

//minify our js
gulp.task('minify', function(){
    return gulp.src('src/js/*.js')
        .pipe(plumber())
        .pipe( uglify() )
        .pipe( gulp.dest('./build/js') )
        .pipe( reload({stream:true}) );
});

//compress those images
gulp.task('crush_imgs', function() {
    return gulp.src('src/assets/*')
    .pipe(imagemin({
            progressive: true,
        }))
    .pipe(gulp.dest('./build/assets/'));
});

//default task runs on gulp - run styles, open up browsersync and watch our files
//build_baby_build is only used when you deploy a project :D
gulp.task('default', ['styles', 'minify','browser_sync', 'compile_html', 'watch'])
gulp.task('build_baby_build', ['styles', 'minify', 'crush_imgs', 'compile_html'])