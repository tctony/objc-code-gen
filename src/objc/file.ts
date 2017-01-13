/// <reference path="./../../typings/index.d.ts" />

import * as vf from 'vinyl';
import { IElement } from './element';

export class File implements IElement {
  public vinyl: vf;
  public elements: IElement[];

  public constructor(vinyl: vf, elements: IElement[]) {
    this.vinyl = vinyl;
    this.elements = elements;
  }

  public render(): string {
    return this.elements.map((elem: IElement) => {
      return elem.render();
    }).join('\n');
  }
}
