// <reference path="./../../typings/index.d.ts" />

import * as Factory from './factory';
import * as vf from 'vinyl';
import * as ObjC from '../objc';

/**
 * SimpleParser create empty class for each name in input file.
 */
export function SimpleParser() {
  return Factory.createParser(function (file: vf, content: string) {
    const out = <Factory.Out>this;

    if (content) {
      const classDefines: (string | [string, string])[] = [];
      content.split('\n').map(function (line) {
        if (line.trim().length == 0) return;

        const names = line.split(':');
        if (names.length > 1) {
          classDefines.push([names[0].trim(), names[1].trim()]);
        }
        else if (names.length > 0) {
          classDefines.push(names[0].trim());
        }
      });

      if (classDefines.length > 0) {
        const hfile = ObjC.File.h(file);
        const mfile = ObjC.File.m(file);
        hfile.elements.push(new ObjC.ImportElement('Foundation', 'Foundation', ObjC.ImportType.Std));
        mfile.elements.push(new ObjC.ImportElement(file.stem));

        classDefines.map((define) => {
          if (typeof define === 'string') {
            hfile.elements.push(new ObjC.ClassDeclarationElement(define));
            mfile.elements.push(new ObjC.ClassImplementationElement(define));
          }
          else if (define instanceof Array) {
            hfile.elements.push(new ObjC.ClassDeclarationElement(define[0], define[1]));
            mfile.elements.push(new ObjC.ClassImplementationElement(define[0]));
          } else {
            throw new Error(`invalid define: ${define}`);
          }
        });

        out.push(hfile);
        out.push(mfile);
      }
    }
  });
}
