/// <reference path="../typings/index.d.ts" />

import * as vfs from 'vinyl-fs';
import * as merge from 'merge2';
import { SimpleParser, DummyParser } from './parser';
import { Generator } from './objc';

export function process(inputDir: string, outputDir: string): void {
  const input = merge(
    vfs.src(inputDir + '/Dummy.in').pipe(DummyParser()),
    vfs.src(inputDir + '/*.simple').pipe(SimpleParser())
  );
  input.pipe(Generator())
    .pipe(vfs.dest(outputDir));
}
