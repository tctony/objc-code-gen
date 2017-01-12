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
      const elements: ObjC.IElement[] = [];
      content.split('\n').map(function (name) {
        name = name.trim();
        if (name.length > 0) {
          elements.push(new ObjC.ClassElement(name));
        }
      });
      out.push(new ObjC.File(file, elements));
    }
  });
}
