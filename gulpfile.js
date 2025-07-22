const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

// Compile TypeScript sources
gulp.task('build-ts', () => {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});

// Copy SVG icon files from nodes folder to dist/nodes
gulp.task('copy-assets', () => {
  return gulp.src('nodes/**/*.svg')
    .pipe(gulp.dest('dist/nodes'));
});

// Run both tasks in sequence in the default build
gulp.task('build', gulp.series('build-ts', 'copy-assets'));
