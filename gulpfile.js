var gulp = require('gulp'),
  gulp_ts = require('gulp-typescript'),
  typescript = require('typescript'),
  merge = require('merge2'),
  del = require('del'),
  spawn = require('child_process').spawn;

var cfg = {
  project: gulp_ts.createProject('./tsconfig.json'),
  bin: "./bin/objc-code-gen",
  base: "./src/",
  dest: "./bin/dist/",
  src: ["./src/**/*.ts"],
  out: ["./bin/dist/**/*"]
};

gulp.task('clean', clean(cfg));
gulp.task('build', build(cfg));
gulp.task('run', ['build'], run(cfg));
gulp.task('default', ['run']);
gulp.task('test', ['build'], test(cfg));
gulp.task('watch', watch(src(cfg), ['test']));

function src(..._) {
  return Array.from(arguments).reduce(function(srcs, cfg) {
    return srcs.concat(cfg.src);
  }, []);
}

function clean(cfg) {
  return function() {
    return del(cfg.out);
  };
}

function build(cfg) {
  return function() {
    var tee = gulp
        .src(cfg.src, { base: cfg.base })
        .pipe(cfg.project());
    return merge([
      tee.js.pipe(gulp.dest(cfg.dest)),
      tee.dts.pipe(gulp.dest(cfg.dest))
    ]);
  };
}

function run(cfg) {
  return function(done) {
    var args = [ cfg.bin ];
    console.log(`Running ${args} ...`);
    spawn(process.argv[0], args, { stdio: "inherit" }).on("exit", function(code) {
      done(code !== 0 ? `${code}` : undefined);
    });
  };
}

function test(cfg) {
  return function() {
    console.log('test nothing now');
  };
}

function watch(src, tasks) {
  return function() {
    return gulp.watch(src, tasks);
  };
}
