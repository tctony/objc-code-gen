/// <reference path="./../../typings/index.d.ts" />

import * as vf from 'vinyl';
import { IElement, Element } from './element';

export class File extends Element {
  public vinyl: vf;
  public elements: IElement[];

  public constructor(vinyl: vf, elements: IElement[] = []) {
    super('File');
    this.vinyl = vinyl.clone({ contents: false });
    this.elements = elements;
  }

  public render(): string {
    return this.elements.map((elem: IElement) => {
      return elem.render();
    }).join('\n');
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
