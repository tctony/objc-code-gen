import { Maybe } from "../coreutil";

export interface IElement {
  render: () => string;
}

export class CommentElement implements IElement {
  private content: string;

  public constructor(content: string) {
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

export class ImportElement implements IElement {
  private fileName: string;
  private libName: Maybe.Maybe<string>;
  private type: ImportType;

  public constructor(fileName: string, libName?: string, type = ImportType.User) {
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

export class ClassElement implements IElement {

  private name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public render(): string {
    return `@interface ${this.name} : NSObject\n\n@end`;
  }
}

