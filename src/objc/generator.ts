/// <reference path="./../../typings/index.d.ts" />

import * as through2 from 'through2';
import { File } from './file';
import { IElement } from './element';
import * as moment from 'moment';

export function Generator() {
  return through2.obj(function (file: File, enc: string, cb: () => void) {
    let contents = '// this file is generated by objc-code-gen\n';
    contents += `// time: ${moment().format("YYYY-MM-DD HH:mm:ss")}\n\n`;
    contents = file.elements.reduce((contents: string, elem: IElement) => {
      return contents += elem.render();
    }, contents);

    file.vinyl.contents = new Buffer(contents, 'utf8');
    this.push(file.vinyl);

    cb();
  });
}
