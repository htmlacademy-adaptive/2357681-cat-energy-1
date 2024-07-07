import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';

// Styles

export const styles = () => { //name
  return gulp.src('source/less/style.less', { sourcemaps: true }) //1. style.less
    .pipe(plumber()) //2. обработка ошибок
    .pipe(less()) // style.less -> style.css
    .pipe(postcss([
      autoprefixer(), //style.css -> style.css[prefix]
      csso() // style.css[prefix] -> style.css[prefix, min]
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('source/css', { sourcemaps: '.' })) //3. положить файл и карту кода в нужную папку
    .pipe(browser.stream());
}

export const css = () => {
  return gulp.src('./src/*.css')
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(gulp.dest('./dest'))
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}


export default gulp.series(
  styles, server, watcher
);
