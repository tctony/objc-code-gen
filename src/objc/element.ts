import { Maybe } from "../coreutil";

export interface IElement {
  render: () => string;
}

export class ClassElement {
  private name: string;
  public constructor(name: string) {
    this.name = name;
  }

  public render(): string {
    return `@interface ${this.name} : NSObject\n\n@end\n\n`;
  }
}

// export interface Comment {
//   content: string;
// }

// export interface Import {
//   file: string;
//   isPublic: boolean;
//   library: Maybe.Maybe<string>;
// }

// export enum ForwardDeclarationType {
//   class,
//   protocol
// }

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
