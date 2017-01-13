/// <reference path="./../../typings/index.d.ts" />

import * as Factory from './factory';
import * as vf from 'vinyl';
import * as ObjC from '../objc';

/**
 * Dummy Parser create hard coded `ObjC.File` from dummy input file for develop or test purpose;
 */
export function DummyParser() {
  return Factory.createParser(function (file: vf) {
    const objcFile = new ObjC.File(file);
    // TODO add elements here
    (<Factory.Out>this).push(objcFile);
  });
}
