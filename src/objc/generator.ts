/// <reference path="./../../typings/index.d.ts" />

import * as through2 from 'through2';
import { File } from './file';
import { IElement, CommentElement } from './element';
import * as moment from 'moment';

export function Generator() {
  return through2.obj(function (file: File, enc: string, cb: () => void) {
    // TODO maybe make this as a plugin
    file.addElement(new CommentElement('// this file is generated by objc-code-gen'), true);
    file.addElement(new CommentElement(`// time: ${moment().format("YYYY-MM-DD HH:mm:ss")}`), true);

    file.vinyl.contents = new Buffer(file.render(), 'utf8');

    console.log('generated: ' + file.vinyl.basename);

    this.push(file.vinyl);

    cb();
  });
}
