'use strict';

let gulp = require('gulp');
let browserify = require('browserify');
let babel = require('gulp-babel');
let babelify = require('babelify');
let brfs = require('brfs');
let source = require('vinyl-source-stream');
let fs = require('fs');
let crx = require('gulp-crx');
let mocha = require('gulp-mocha');
let cat = require('gulp-cat');

function createBrowserifyBundle(srcPath) {
  return () => {
    let bundler = browserify('./src/' + srcPath, { debug: true });
    return bundler
    .transform(babelify)
    .transform(brfs)
    .bundle()
    .on('error', e => {
      console.error(e);
      bundler.emit('end');
    })
    .pipe(source(srcPath))
    .pipe(gulp.dest('./build'));
  };
}

gulp.task('mochaTest', (cb) => {


  let tests = gulp.src('./src/js/**/*.spec.js')
    //.pipe(createBrowserifyBundle)

    //.pipe(babel())
    //.pipe(cat())
    .pipe(mocha({reporter: 'spec'}));//.on('end', function(){cb();});
  return Promise.resolve(tests);
});

gulp.task('background', createBrowserifyBundle('js/background.js'));
gulp.task('popup', createBrowserifyBundle('js/popup.js'));
gulp.task('content', createBrowserifyBundle('js/content.js'));

gulp.task('js', ['background', 'popup', 'content']);

gulp.task('html', () => {
  return gulp.src('./src/html/popup.html')
    .pipe(gulp.dest('./build/html'));
});

gulp.task('css', () => {
});

gulp.task('img', () => {
  return gulp.src('./src/img/**/*.png')
    .pipe(gulp.dest('./build/img'));
});

gulp.task('copy', () => {
  return gulp.src(['./manifest.json'])
    .pipe(gulp.dest('./build'));
});

gulp.task('build', ['mochaTest', 'js', 'html', 'css', 'img', 'copy']);

gulp.task('watch', () => {
  gulp.watch(['manifest.json', 'src/**'], ['build']);
});

gulp.task('dist', ['build'], () => {
  let manifest = require('./manifest.json');
  return gulp.src('./build/**')
    .pipe(crx({
      privateKey: fs.readFileSync('./build.pem', 'utf8'),
      filename: manifest.name + '-' + manifest.version + '.crx'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);
