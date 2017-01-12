/// <reference path="../typings/index.d.ts" />

import * as vfs from 'vinyl-fs';
import { SimpleParser } from './parser';
import { Generator } from './objc';

export function process(inputDir: string, outputDir: string): void {
  vfs.src(inputDir + '/*')
    .pipe(SimpleParser())
    .pipe(Generator())
    .pipe(vfs.dest(outputDir));
}
