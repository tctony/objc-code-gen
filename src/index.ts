/// <reference path="../typings/index.d.ts" />


import * as vfs from 'vinyl-fs';

export function process(inputDir: string, outputDir: string): void {
  vfs.src(inputDir + '/*', )
    .pipe(vfs.dest(outputDir));
}
