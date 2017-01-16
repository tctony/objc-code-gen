/// <reference path="./../../typings/index.d.ts" />

import * as vf from 'vinyl';
import { IElement, ElementArrayContainer } from './element';

export class File extends ElementArrayContainer {
  public vinyl: vf;

  public constructor(vinyl: vf, elements: IElement[] = []) {
    super('File', elements);
    this.vinyl = vinyl.clone({ contents: false });
  }

  public static h(vinyl: vf, elements: IElement[] = []) {
    const f = new File(vinyl, elements);
    f.vinyl.extname = '.h';
    return f;
  }

  public static m(vinyl: vf, elements: IElement[] = []) {
    const f = new File(vinyl, elements);
    f.vinyl.extname = '.m';
    return f;
  }
}
