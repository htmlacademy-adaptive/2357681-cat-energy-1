import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
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
    .pipe(gulp.dest('build/css', { sourcemaps: '.' })) //3. положить файл и карту кода в нужную папку
    .pipe(browser.stream());
}

//HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'))
}

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,webp}')
  .pipe(gulp.dest('build/img'))
}

// WebP

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh({webp: {}}))
  .pipe(gulp.dest('build/img'))
}

// SVG

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/icons/sprite/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}

const sprite = () => {
  return gulp.src('source/img/icons/sprite/*.svg')
  .pipe(svgo())
  .pipe(svgstore({inlineSvg: true}))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}

// Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest'],
  {base: 'source'})

  .pipe(gulp.dest('build'))
  done();
}

// Clean

const clean = () => {
  return del('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}


// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
