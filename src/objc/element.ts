import { Maybe } from "../coreutil";

export interface IElement {
  render: () => string;
}

export abstract class Element implements IElement {
  public elementName: string;

  public constructor(name: string) {
    this.elementName = name;
  }

  public description(): string {
    return `${this.elementName}`;
  }

  public abstract render(): string;
}

export class CommentElement extends Element {
  private content: string;

  public constructor(content: string) {
    super('Comment');
    this.content = content;
  }

  public render(): string {
    return this.content;
  }
}

export enum ImportType {
  User, // render to ""
  Std, // render to <>
}

export class ImportElement extends Element {
  private fileName: string;
  private libName: Maybe.Maybe<string>;
  private type: ImportType;

  public constructor(fileName: string, libName?: string, type = ImportType.User) {
    super('Import');
    this.fileName = fileName;
    this.libName = (libName === undefined ? Maybe.Nothing<string>() : Maybe.Just(libName));
    this.type = type;
  }

  public render(): string {
    let contents = this.fileName;
    if (!contents.endsWith('.h') && !contents.endsWith('.hpp')) {
      contents += '.h';
    }

    contents = Maybe.match((libName: string) => {
      return contents = libName + '/' + contents;
    }, () => {
      return contents;
    }, this.libName);

    switch (this.type) {
      case ImportType.User: {
        contents = `"${contents}"`;
        break;
      }
      case ImportType.Std: {
        contents = `<${contents}>`;
        break;
      }
    }

    return `#import ${contents}`;
  }
}

export enum ForwardDeclarationType {
  class,
  protocol
}

// export class ForwardDeclaration {
//   private name: string;
//   private declarationType: ForwardDeclarationType;

//   constructor(name: string, type: ForwardDeclarationType) {
//     this.name = name;
//     this.declarationType = type;
//   }

//   match<T>(classDeclaration: (name: string) => T, protocolDeclaration: (name: string) => T) {
//     switch (this.declarationType) {
//       case ForwardDeclarationType.class:
//         return classDeclaration(this.name);
//       case ForwardDeclarationType.protocol:
//         return protocolDeclaration(this.name);
//     }
//   }
// }

// export function ForwardClassDeclaration(name: string) {
//   return new ForwardDeclaration(name, ForwardDeclarationType.class);
// }

// export function ForwardProtocolDeclaration(name: string) {
//   return new ForwardDeclaration(name, ForwardDeclarationType.protocol);
// }


// export interface Type {
//   name: string;
//   reference: string;
// }

export class ClassDeclarationElement extends Element {
  private className: string;
  private superClassName: string;

  public constructor(className: string, superClassName = 'NSObject') {
    super('ClassDeclaration');
    this.className = className;
    this.superClassName = superClassName;
  }

  public description(): string {
    return super.description() + ' ' + this.className + '@' + this.superClassName;
  }

  public render(): string {
    return `\n@interface ${this.className} : ${this.superClassName}\n\n@end`;
  }
}

export class ClassImplementationElement extends Element {
  private className: string;

  public constructor(className: string) {
    super('Class');
    this.className = className;
  }

  public description(): string {
    return super.description() + ' ' + this.className;
  }

  public render(): string {
    return `\n@implementation ${this.className}\n\n@end`;
  }
}

