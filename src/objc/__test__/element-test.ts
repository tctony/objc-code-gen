/// <reference path="./../../../typings/index.d.ts" />

import * as E from '../element';

describe('Element.render', () => {

  function renderExpect(element: E.IElement) {
    return expect(element.render());
  }

  describe('Comment:', () => {
    it('comment render just returns the input', () => {
      const lineComment = '// this is a line comment';
      renderExpect(new E.CommentElement(lineComment)).toEqual(lineComment);

      const blockComment = `/* this is
block comment */`;
      renderExpect(new E.CommentElement(blockComment)).toEqual(blockComment);
    });
  });

  describe('Import:', () => {
    const fileName = 'fileName';
    const libName = 'libName';

    it('simple import', () => {
      renderExpect(new E.ImportElement(fileName)).toEqual(`#import "${fileName}.h"`);

      renderExpect(new E.ImportElement(`${fileName}.h`)).toEqual(`#import "${fileName}.h"`);

      renderExpect(new E.ImportElement(`${fileName}.hpp`)).toEqual(`#import "${fileName}.hpp"`);

      renderExpect(new E.ImportElement(`${fileName}.abc`)).toEqual(`#import "${fileName}.abc.h"`);
    });

    it('lib import', () => {
      renderExpect(new E.ImportElement(fileName, libName)).toEqual(`#import "${libName + '/' + fileName}.h"`);
    })

    it('stanard library import', () => {
      renderExpect(new E.ImportElement(fileName, undefined, E.ImportType.Std)).toEqual(`#import <${fileName}.h>`);
    });
  });

  describe('Class:', () => {
    const className = 'className';

    it('simple class', () => {
      renderExpect(new E.ClassElement(className)).toEqual(`@interface ${className} : NSObject\n\n@end`);
    })
  })
});
