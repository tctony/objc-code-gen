/// <reference path="./../../typings/index.d.ts" />

import * as vf from 'vinyl';
import * as ObjC from '../objc';
import * as through2 from 'through2';

export type ParseFunction = (file: vf, content?: string) => void;
export type EndFunction = (cb: () => void) => void;
export interface Out extends through2.This {
  push: (file: ObjC.File) => void
}

export function createParser(parse: ParseFunction, end?: EndFunction) {
  return through2.obj(function (file: vf, enc: string, cb: () => void) {
    if (file.contents instanceof Buffer) {
      parse.call(this, file, file.contents.toString(enc));
    } else {
      console.error(`contents of file(${file.path}) is not buffer`);
      parse.call(this, file);
    }
    cb();
  }, end);
}
