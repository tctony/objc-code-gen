'use strict';
const gulp = require('gulp');
const gulp_util = require('gulp-util');
const gulp_seq = require('gulp-sequence');
const gulp_changed = require('gulp-changed');
const gulp_debug = require('gulp-debug');
const gulp_ts = require('gulp-typescript');
const gulp_watch = require('gulp-watch');
const gulp_batch = require('gulp-batch');
const typescript = require('typescript');
const merge = require('merge2');
const del = require('del');
const spawn = require('child_process').spawn;
const Jasmine = require('jasmine');

const cfg = {
  project: gulp_ts.createProject('./tsconfig.json', {
    typescript: typescript
  }),
  bin: "./bin/objc-code-gen.js",
  base: "./src/",
  src: ["./src/**/*.ts", "!./src/**/__test__/*.ts"],
  testsrc: ["./src/**/__test__/*.ts"],
  dest: "./bin/dist/",
  out: ["./bin/dist/**/*"]
};

gulp.task('clean', () => {
  return del(cfg.out);
});

function compile(srcs) {
  return gulp
    .src(srcs, {
      base: cfg.base
    })
    .pipe(gulp_changed(cfg.dest, {
      extension: ".js"
    }))
    .pipe(gulp_debug({
      title: "tsc:"
    }))
    .pipe(cfg.project());
}

gulp.task('build', () => {
  const ts = compile(cfg.src);
  return merge([
    ts.js.pipe(gulp.dest(cfg.dest))//,
    //ts.dts.pipe(gulp.dest(cfg.dest))
  ]);
});

gulp.task('cleanBuild', gulp_seq('clean', 'build'));

gulp.task('buildTest', ['build'], () => {
  const ts = compile(cfg.testsrc);
  return ts.js.pipe(gulp.dest(cfg.dest));
});

gulp.task('cleanBuildTest', gulp_seq('clean', 'buildTest'));

gulp.task('watch', () => {
  gulp_watch(cfg.src.concat(cfg.testsrc), gulp_batch((events, done) => {
    // TODO handle file delete event
    gulp_seq(['build', 'buildTest'])(() => {
      done();
    });
  }));
  return { then: () => { } };
});

function runShell(prog, args, done) {
  gulp_util.log(`Running:'${prog} ${args.join(' ')}'`);
  spawn(prog, args, {
    stdio: "inherit"
  }).on("exit", function (code) {
    done(code !== 0 ? `${code}` : undefined);
  });
}

gulp.task('run', ['build'], (done) => {
  // TODO pass more args
  const args = [cfg.bin];
  runShell(process.argv[0], args, done);
});
gulp.task('default', (done) => {
  runShell('./node_modules/.bin/gulp', ['--tasks-simple'], done);
});

gulp.task('test', ['buildTest'], (done) => {
  const jasmine = new Jasmine();
  const config = {
    spec_dir: "./bin/dist/",
    spec_files: ['**/__test__/*.js'],
    helpers: ['']
  };
  jasmine.loadConfig(config);
  jasmine.addReporter({
    jasmineDone: function () {
      done(0);
    }
  });
  jasmine.execute();
});
