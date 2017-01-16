/// <reference path="./../../../typings/index.d.ts" />

import * as E from '../element';

describe('Element', () => {

  function renderExpect(element: E.IElement) {
    return expect(element.render());
  }

  describe('ArrayContainer', () => {
    const arrayContainer = new E.ElementArrayContainer('ArrayContainer');
    it('array container is emtpy by default', () => {
      renderExpect(arrayContainer)
        .toEqual('');
    });

    it('array container add elment', () => {
      arrayContainer.addElement(new E.CommentElement('1'));
      renderExpect(arrayContainer)
        .toEqual('1');
    });

    it('array container add element on front', () => {
      arrayContainer.addElement(new E.CommentElement('0'), true);
      renderExpect(arrayContainer)
        .toEqual('0\n1');
    });

    it('array container render separator', () => {
      class TestArrayContainer extends E.ElementArrayContainer {
        public render(): string {
          return this.renderElements(' ');
        }
      }

      const container = new TestArrayContainer('TestArrayContainer');
      container.addElement(new E.CommentElement('1'));
      container.addElement(new E.CommentElement('2'));
      container.addElement(new E.CommentElement('3'));
      renderExpect(container)
        .toEqual('1 2 3');
    })


  })

  describe('Comment:', () => {
    it('comment render just returns the input', () => {
      const lineComment = '// this is a line comment';
      renderExpect(new E.CommentElement(lineComment))
        .toEqual(lineComment);

      const blockComment = `/* this is
block comment */`;
      renderExpect(new E.CommentElement(blockComment))
        .toEqual(blockComment);
    });
  });

  describe('Import:', () => {
    const fileName = 'fileName';
    const libName = 'libName';

    it('simple import', () => {
      renderExpect(new E.ImportElement(fileName))
        .toEqual(`#import "${fileName}.h"`);

      renderExpect(new E.ImportElement(`${fileName}.h`))
        .toEqual(`#import "${fileName}.h"`);

      renderExpect(new E.ImportElement(`${fileName}.hpp`))
        .toEqual(`#import "${fileName}.hpp"`);

      renderExpect(new E.ImportElement(`${fileName}.abc`))
        .toEqual(`#import "${fileName}.abc.h"`);
    });

    it('lib import', () => {
      renderExpect(new E.ImportElement(fileName, libName))
        .toEqual(`#import "${libName + '/' + fileName}.h"`);
    })

    it('stanard library import', () => {
      renderExpect(new E.ImportElement(fileName, undefined, E.ImportType.Std))
        .toEqual(`#import <${fileName}.h>`);
    });
  });

  describe('ClassDeclaration:', () => {
    const className = 'className';
    const superClassName = 'superClassName';
    const categoryName = 'categoryName';

    it('simple class declaration', () => {
      renderExpect(new E.ClassDeclarationElement(className))
        .toEqual(`\n@interface ${className} : NSObject\n\n@end`);

      renderExpect(new E.ClassDeclarationElement(className, superClassName))
        .toEqual(`\n@interface ${className} : ${superClassName}\n\n@end`);
    });

    it('category declaration', () => {
      renderExpect(new E.ClassDeclarationElement(className, undefined, categoryName))
        .toEqual(`\n@interface ${className} (${categoryName})\n\n@end`);
    })
  });

  fdescribe('ClassImplementation:', () => {
    const className = 'className';
    const categoryName = 'categoryName';

    it('simple class implementation', () => {
      renderExpect(new E.ClassImplementationElement(className))
        .toEqual(`\n@implementation ${className}\n\n@end`);
    });

    it('category class implementation', () => {
      renderExpect(new E.ClassImplementationElement(className, categoryName))
        .toEqual(`\n@implementation ${className} (${categoryName})\n\n@end`);
    })

    it('category class implementation throw on empty category name', () => {
      expect(() => {
        new E.ClassImplementationElement(className, '');
      }).toThrow();
    })
  });
});
