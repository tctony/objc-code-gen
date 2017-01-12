/// <reference path="./../../typings/index.d.ts" />

import * as vf from 'vinyl';
import { IElement } from './element';

export class File {
  constructor(public vinyl: vf, public elements: IElement[]) {
  }
}
