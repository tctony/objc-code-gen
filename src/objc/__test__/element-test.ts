/// <reference path="./../../../typings/index.d.ts" />

import * as E from '../element';
import * as _ from 'lodash';

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
    });
  });

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
    });

    it('stanard library import', () => {
      renderExpect(new E.ImportElement(fileName, undefined, E.ImportType.Std))
        .toEqual(`#import <${fileName}.h>`);
    });
  });

  describe('ForwardDeclaration:', () => {
    it('forward declaration type', () => {
      const name = 'name';
      renderExpect(new E.ForwardDeclarationElement.ClassForwardDecl(name))
        .toEqual(`\n@class ${name};`);
      renderExpect(new E.ForwardDeclarationElement.ProtocolForwardDecl(name))
        .toEqual(`\n@protocol ${name};`);
    });

    it('declaration names', () => {
      const name = 'name';
      renderExpect(new E.ForwardDeclarationElement.ClassForwardDecl())
        .toEqual(`\n@class ;`)
      renderExpect(new E.ForwardDeclarationElement.ClassForwardDecl(name + '0', name + '1'))
        .toEqual(`\n@class name0, name1;`)
    });
  });

  describe('ClassDeclaration:', () => {
    const className = 'className';
    const superClassName = 'superClassName';
    const categoryName = 'categoryName';
    const proto0 = 'proto0';
    const proto1 = 'proto1';

    it('simple class declaration', () => {
      renderExpect(new E.ClassDeclarationElement(className))
        .toEqual(`\n@interface ${className} : NSObject\n\n@end`);

      renderExpect(new E.ClassDeclarationElement(className, superClassName))
        .toEqual(`\n@interface ${className} : ${superClassName}\n\n@end`);
    });

    it('category declaration', () => {
      renderExpect(new E.ClassDeclarationElement(className, undefined, categoryName))
        .toEqual(`\n@interface ${className} (${categoryName})\n\n@end`);
    });

    it('class declaration with implemented protocols', () => {
      const classDecl = new E.ClassDeclarationElement(className);
      classDecl.implementProtocol(proto0);
      renderExpect(classDecl)
        .toEqual(`\n@interface ${className} : NSObject <${proto0}>\n\n@end`);

      classDecl.implementProtocol(proto1);
      renderExpect(classDecl)
        .toEqual(`\n@interface ${className} : NSObject <${proto0}, ${proto1}>\n\n@end`);
    });

    it('class with properties and method declaration', () => {
      const classDecl = new E.ClassDeclarationElement(className);
      const property = new E.PropertyElement('property0', E.Type.ValueType('int'), E.PropertyModifierMemory.assign);
      const method = new E.MethodDeclarationElement(false, E.Type.ValueType('void'), 'methodName');

      function result(elems: E.IElement[]): string {
        return `\n@interface ${className} : NSObject\n${elems.map((v) => { return v.render(); }).join('\n')}\n\n@end`;
      }

      classDecl.addProperty(property);
      renderExpect(classDecl)
        .toEqual(result([property]));

      classDecl.addProperty(property, property);
      renderExpect(classDecl)
        .toEqual(result([property, property, property]));

      classDecl.addMethod(method);
      renderExpect(classDecl)
        .toEqual(result([property, property, property, method]));

      classDecl.addElement(property);
      renderExpect(classDecl)
        .toEqual(result([property, property, property, method, property]));

      classDecl.addElement(method);
      renderExpect(classDecl)
        .toEqual(result([property, property, property, method, property, method]));

      expect(() => {
        classDecl.addElement({ render: () => { return ''; } })
      }).toThrow();
    });
  });

  describe('ClassImplementation:', () => {
    const className = 'className';
    const categoryName = 'categoryName';

    it('simple class implementation', () => {
      renderExpect(new E.ClassImplementationElement(className))
        .toEqual(`\n@implementation ${className}\n\n@end`);
    });

    it('category class implementation', () => {
      renderExpect(new E.ClassImplementationElement(className, categoryName))
        .toEqual(`\n@implementation ${className} (${categoryName})\n\n@end`);
    });

    it('category class implementation throw on empty category name', () => {
      expect(() => {
        new E.ClassImplementationElement(className, '');
      }).toThrow();
    });

    it('class implemented with method', () => {
      const c = new E.ClassImplementationElement(className);
      const d = new E.MethodDeclarationElement(false, E.Type.ValueType('void'), 'methodName');
      const m = new E.MethodImplementationElement(d);

      function result(...methods: E.MethodImplementationElement[]): string {
        return `\n@implementation ${className}\n${methods.map((v) => { return v.render(); }).join('\n')}\n\n@end`;
      }

      c.addMethod(m);
      renderExpect(c).toEqual(result(m));

      expect(() => {
        c.addElement({ render: () => { return ''; } });
      }).toThrow();
    });
  });

  describe('Protocol:', () => {
    const protocolName = 'ProtocolName';
    const baseProtocols = ['b1', 'b2'];

    it('simple protocol', () => {
      renderExpect(new E.ProtocolElement(protocolName))
        .toEqual(`\n@protocol ${protocolName} <NSObject>\n\n@end`);
    });

    it('protocol inherit', () => {
      renderExpect(new E.ProtocolElement(protocolName, baseProtocols))
        .toEqual(`\n@protocol ${protocolName} <${baseProtocols.join(', ')}>\n\n@end`)
    });
  });

  describe('Type:', () => {
    const typeName = 'TypeName';
    const protocolName = 'ProtocolName';

    it('value type', () => {
      renderExpect(E.Type.ValueType(typeName))
        .toEqual(typeName);
    });

    it('pointer type', () => {
      renderExpect(E.Type.PointerType(typeName))
        .toEqual(typeName + ' *');
    });

    it('protocol type', () => {
      renderExpect(E.Type.ProtocolType(protocolName))
        .toEqual(`id<${protocolName}>`);
    });

    it('complex type', () => {
      renderExpect(new E.Type(typeName, false, [protocolName]))
        .toEqual(`${typeName}<${protocolName}>`);

      renderExpect(new E.Type(typeName, true, [protocolName]))
        .toEqual(`${typeName}<${protocolName}> *`);

      renderExpect(new E.Type(typeName, true, [protocolName, protocolName]))
        .toEqual(`${typeName}<${protocolName}, ${protocolName}> *`);
    });
  });

  describe('Property:', () => {
    const propertyName = 'propertyName';
    const propertyType = E.Type.ValueType('NSObject');
    const memoryKeyword = E.PropertyModifierMemory.strong;

    it('any property', () => {
      renderExpect(new E.PropertyElement(propertyName, propertyType, memoryKeyword))
        .toEqual(`\n@property (nonatomic, ${E.PropertyModifierMemory[memoryKeyword]}) ${propertyType.render()} ${propertyName};`);
    });
  });

  describe('MethodNameComponent:', () => {
    const m = 'methodName';
    const t = E.Type.ValueType('ParameterType');
    const p = 'parameterName';

    it('name component without parameter', () => {
      renderExpect(new E._MethodNameComponent(m))
        .toEqual(m);
    });

    it('name component with parameter', () => {
      renderExpect(new E._MethodNameComponent(m, t, p))
        .toEqual(`${m}:(${t.render()})${p}`);
    });
  });

  describe('MethodDeclaration:', () => {
    const m = 'methodName';
    const t = E.Type.ValueType('ParameterType');
    const p = 'parameterName';

    it('instance method without parameter', () => {
      renderExpect(new E.MethodDeclarationElement(false, E.Type.ValueType('void'), m))
        .toEqual('\n- (void)' + m + ';');
    });

    it('class method without parameter', () => {
      renderExpect(new E.MethodDeclarationElement(true, E.Type.ValueType('void'), m))
        .toEqual('\n+ (void)' + m + ';');
    });

    it('class method with one parameter', () => {
      renderExpect(new E.MethodDeclarationElement(true, E.Type.ValueType('void'), [m], [t], [p]))
        .toEqual(`\n+ (void)${m}:(${t.render()})${p};`);
    });

    it('class method with multi parameter', () => {
      renderExpect(new E.MethodDeclarationElement(true, E.Type.ValueType('void'), [m, m], [t, t], [p, p]))
        .toEqual(`\n+ (void)${m}:(${t.render()})${p} ${m}:(${t.render()})${p};`);
    });

    it('throw on lack of parameters', () => {
      expect(() => {
        new E.MethodDeclarationElement(true, E.Type.ValueType('void'), [m, m], [t, t], [p]);
      }).toThrow();
    });
  });

  describe('MethodImplementation:', () => {
    const d = new E.MethodDeclarationElement(false, E.Type.ValueType('void'), 'someMagicMethod');

    function result(...codes: E.CodeElement[]): string {
      let bodyString = codes.map((c) => { return c.renderWithIndent(new E.SpaceIndent(1)); }).join(';\n');
      if (bodyString.length > 0) bodyString += ';';
      return d.render().replace(';', '\n{\n') + bodyString + '\n}';
    }

    it('empty method implementation', () => {
      renderExpect(new E.MethodImplementationElement(d))
        .toEqual(result());
    });

    it('method implementation', () => {
      const c = new E.CodeMethodCallElement('super', 'method');

      renderExpect(new E.MethodImplementationElement(d, [c]))
        .toEqual(result(c));
      renderExpect(new E.MethodImplementationElement(d, [c, c]))
        .toEqual(result(c, c));
    });
  });

  describe('Indent:', () => {
    it('space indent', () => {
      const i = new E.SpaceIndent();
      renderExpect(i).toEqual('');
      renderExpect(i.forward()).toEqual(_.repeat(' ', 4));
      renderExpect(i.forward().backward()).toEqual(_.repeat(' ', 0));
      expect(() => { i.backward() }).toThrow();

      renderExpect(new E.SpaceIndent(1)).toEqual(_.repeat(' ', 4));
      renderExpect(new E.SpaceIndent(1, 2)).toEqual(_.repeat(' ', 2));
    });
  });

  describe('CodeElement:', () => {
    it('ElementName', () => {
      expect(new E.CodeExpressionElement('').elementName)
        .toEqual('Code-Expression');

      expect(new E.CodeAssignmentElement('', new E.CodeExpressionElement('')).elementName)
        .toEqual('Code-Assignment');
    });

    function renderExpectWithIndent(codeElem: E.CodeElement, indent: E.Indent) {
      return expect(codeElem.renderWithIndent(indent));
    }

    const l0 = new E.SpaceIndent(0);
    const l1 = l0.forward();
    const l2 = l1.forward();

    describe('Expression:', () => {
      const a = 'a';
      const e = new E.CodeExpressionElement(a);

      it('expression without indent', () => {
        renderExpect(e).toEqual(a);
      });

      it('expression with indent', () => {
        renderExpectWithIndent(e, l0).toEqual(a);

        renderExpectWithIndent(e, l1).toEqual(_.repeat(' ', 4) + a);

        renderExpectWithIndent(e, l2).toEqual(_.repeat(' ', 8) + a);
      });
    });

    describe('MethodCall', () => {
      const r = 'self';
      const m = 'method';
      const p = 'parameter';

      it('call method without parameter', () => {
        const e = new E.CodeMethodCallElement(r, m);

        renderExpectWithIndent(e, l0)
          .toEqual('[self method]');

        renderExpectWithIndent(e, l1)
          .toEqual('    [self method]');
      });

      it('call method with one parameter', () => {
        const e = new E.CodeMethodCallElement(r, [m], [p]);

        renderExpectWithIndent(e, l0)
          .toEqual('[self method:parameter]');
      });

      it('call method with multi parameter', () => {
        const e = new E.CodeMethodCallElement(r, [m, m], [p, p]);

        renderExpectWithIndent(e, l0)
          .toEqual('[self method:parameter method:parameter]');
      });

      it('call method throw on mismatch', () => {
        expect(() => {
          new E.CodeMethodCallElement(r, [m, m], [p]);
        }).toThrow();
      });
    });

    describe('Assignment:', () => {
      it('assignment', () => {
        const a = 'a';
        const b = 'b';
        const e = new E.CodeAssignmentElement(a, new E.CodeExpressionElement(b));

        renderExpectWithIndent(e, l0)
          .toEqual(`${a} = ${b}`);

        renderExpectWithIndent(e, l1)
          .toEqual(`    ${a} = ${b}`);
      });
    });
  });
});
