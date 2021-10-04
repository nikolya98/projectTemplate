const projectFoldder = `./dist`;
const sourceFolder = `./src`;
const path = {
  root: {
    src: `${sourceFolder}`,
    dist: `${projectFoldder}`,
  },
  build: {
    html: `${projectFoldder}/`,
    css: `${projectFoldder}/css/`,
    js: `${projectFoldder}/js/`,
    img: `${projectFoldder}/img/`,
    fonts: `${projectFoldder}/fonts/`,
  },
  src: {
    html: [`${sourceFolder}/*.html`, `!${sourceFolder}/_*.html`],
    scss: `${sourceFolder}/scss/style.scss`,
    js: `${sourceFolder}/js/main.js`,
    img: `${sourceFolder}/img/**/*.{jpg,jpeg,png,gif,ico,svg,webp,avif,heif}`,
    fonts: `${sourceFolder}/fonts/**/*.ttf`,
  },
  watch: {
    src: `${sourceFolder}`,
    html: `${sourceFolder}/**/*.html`,
    scss: `${sourceFolder}/scss/**/*.scss`,
    js: `${sourceFolder}/js/**/*.js`,
    img: `${sourceFolder}/img/**/*.{jpg,jpeg,png,gif,ico,svg,webp,avif,heif}`,
  },
  clear: `${projectFoldder}/`,
}

const gulp = require('gulp');
const { src, dest } = require('gulp');
const browsersync = require('browser-sync').create();
const del = require('del');
const fileinclude = require('gulp-file-include');
const beautify = require('gulp-html-beautify');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const webphtml = require('gulp-webp-html');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');


function browserSync() {
  browsersync.init({
    server: {
      baseDir: path.root.dist,
    },
    port: 3000,
    notify: false,
  });
}

function clear() {
  return del(path.clear)
}

function processHtml() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(
      beautify({
        indent_size: 2,
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function processScss() {
  return src(path.src.scss, { allowEmpty: true, })
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    ).on('error', scss.logError)
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        cascade: true,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function processJs() {
  return src(path.src.js, { allowEmpty: true, })
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function processImages() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function insertWebp() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(
      beautify({
        indent_size: 2,
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
};

function otf2ttf() {
  return src(`${sourceFolder}/**/*.otf`)
    .pipe(
      fonter({
        formats: ['ttf'],
      })
    )
    .pipe(dest(`{${sourceFolder}/fonts/}`))
}

function processTtfFonts() {
  return src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
};

function watchFiles() {
  // gulp.watch([path.watch.src], build);
  gulp.watch([path.watch.html], processHtml);
  gulp.watch([path.watch.scss], processScss);
  gulp.watch([path.watch.js], processJs);
  gulp.watch([path.watch.img], images);
}

const build = gulp.series(clear, gulp.parallel(processHtml, processScss, processJs, processImages));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.browserSync = browserSync;
exports.clear = clear;
exports.html = processHtml;
exports.css = processScss;
exports.js = processJs;
exports.image = processImages;
exports.webp = insertWebp;
exports.ttf = processTtfFonts;
exports.otf = otf2ttf;
exports.build = build;
exports.watch = watch;
exports.default = watch;