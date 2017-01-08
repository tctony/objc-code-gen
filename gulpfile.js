'use strict';
const gulp = require('gulp');
const gulp_changed = require('gulp-changed');
const gulp_debug = require('gulp-debug');
const gulp_ts = require('gulp-typescript');
const typescript = require('typescript');
const merge = require('merge2');
const del = require('del');
const spawn = require('child_process').spawn;

const cfg = {
  project: gulp_ts.createProject('./tsconfig.json', {
    typescript: typescript
  }),
  bin: "./bin/objc-code-gen",
  src: ["./src/**/*.ts"],
  base: "./src/",
  dest: "./bin/dist/",
  out: ["./bin/dist/**/*"]
};

gulp.task('clean', clean(cfg));
gulp.task('build', build(cfg));
gulp.task('run', ['build'], run(cfg));
gulp.task('default', ['run']);
gulp.task('test', ['build'], test(cfg));
gulp.task('watch', watch(src(cfg), ['test']));

function src(...configs) {
  return configs.reduce((srcs, cfg) => {
    return srcs.concat(cfg.src);
  }, []);
}

function clean(cfg) {
  return function () {
    return del(cfg.out);
  };
}

function build(cfg) {
  return function () {
    const tee = gulp.src(cfg.src, {
        base: cfg.base
      })
      .pipe(gulp_changed(cfg.dest, {
        extension: ".js"
      }))
      .pipe(gulp_debug({
        title: "tsc:"
      }))
      .pipe(cfg.project());

    return merge([
      tee.js.pipe(gulp.dest(cfg.dest)),
      tee.dts.pipe(gulp.dest(cfg.dest))
    ]);
  };
}

function run(cfg) {
  return function (done) {
    const args = [cfg.bin];
    console.log(`Running ${args} ...`);
    spawn(process.argv[0], args, {
      stdio: "inherit"
    }).on("exit", function (code) {
      done(code !== 0 ? `${code}` : undefined);
    });
  };
}

function test(cfg) {
  return function () {
    console.log('test nothing now');
  };
}

function watch(src, tasks) {
  return function () {
    return gulp.watch(src, tasks);
  };
}
