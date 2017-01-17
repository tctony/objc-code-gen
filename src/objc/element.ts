import { Maybe } from "../coreutil";

export interface IElement {
  render: () => string;
}

export interface IElementContainer {
  addElement: (element: IElement) => void;
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

export class ElementArrayContainer
  extends Element implements IElementContainer {
  protected elements: IElement[];

  public constructor(name: string, elements: IElement[] = []) {
    super(name);
    this.elements = elements;
  }

  public addElement(element: IElement, onFront = false): void {
    if (onFront == false) {
      this.elements.push(element);
    } else {
      this.elements.unshift(element);
    }
  }

  protected renderElements(separator = '\n'): string {
    return this.elements.map((elem: IElement) => {
      return elem.render();
    }).join(separator);
  }

  public render(): string {
    return this.renderElements();
  }
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

export class ForwardDeclarationElement extends Element {
  private type: ForwardDeclarationType;
  private names: string[];

  protected constructor(type: ForwardDeclarationType, names: string[]) {
    super('ForwardDeclaration');
    this.type = type;
    this.names = names;
  }

  private match<T>(classFunc: () => T, protocolFunc: () => T): T {
    switch (this.type) {
      case ForwardDeclarationType.class:
        return classFunc();
      case ForwardDeclarationType.protocol:
        return protocolFunc();
      default:
        throw TypeError(`invalid forward declaration type ${this.type}`);
    }
  }

  public description(): string {
    const tag = this.match(() => { return 'C' }, () => { return 'P'; });
    return `${super.description()} ${this.names.join(',')}(${tag})`;
  }

  public render(): string {
    const tag = this.match(() => { return 'class' }, () => { return 'protocol'; });
    return `\n@${tag} ${this.names.join(', ')};`
  }
}

export module ForwardDeclarationElement {
  export class ClassForwardDecl extends ForwardDeclarationElement {
    constructor(...names: string[]) {
      super(ForwardDeclarationType.class, names);
    }
  }

  export class ProtocolForwardDecl extends ForwardDeclarationElement {
    constructor(...names: string[]) {
      super(ForwardDeclarationType.protocol, names);
    }
  }
}

export class ClassDeclarationElement extends Element {
  private className: string;
  private superClassName: string;
  private categoryName: Maybe.Maybe<string>;
  private implementedProtocols: string[];
  private properties: ElementArrayContainer;

  public constructor(className: string, superClassName = 'NSObject', categoryName?: string) {
    super('ClassDeclaration');
    this.className = className;
    this.superClassName = superClassName;
    this.categoryName = (categoryName === undefined ? Maybe.Nothing<string>() : Maybe.Just(categoryName));
    this.implementedProtocols = [];
    this.properties = new ElementArrayContainer('Properties');
  }

  public implementProtocol(protocol: string): void {
    this.implementedProtocols.push(protocol);
  }

  public addProperty(...properties: PropertyElement[]) {
    properties.forEach((value) => {
      this.properties.addElement(value);
    });
  }

  public description(): string {
    return super.description() + ' ' + this.className + '@' + this.superClassName;
  }

  public render(): string {
    const protocolString = (this.implementedProtocols.length > 0 ? ` <${this.implementedProtocols.join(', ')}>` : '');
    let propertyString = this.properties.render();
    if (propertyString.length > 0) propertyString += '\n';
    return Maybe.match((cateName: string) => {
      return `\n@interface ${this.className} (${cateName})${protocolString}\n${propertyString}\n@end`;
    }, () => {
      return `\n@interface ${this.className} : ${this.superClassName}${protocolString}\n${propertyString}\n@end`;
    }, this.categoryName);
  }
}

export class ClassImplementationElement extends Element {
  private className: string;
  private categoryName: Maybe.Maybe<string>;

  public constructor(className: string, cateName?: string) {
    super('Class');
    this.className = className;
    if (cateName !== undefined) {
      if (cateName.length > 0) {
        this.categoryName = Maybe.Just(cateName);
      }
      else {
        throw new Error('Creating category implementation with empty category name is probably by mistaken');
      }
    }
    else {
      this.categoryName = Maybe.Nothing<string>();
    }
  }

  public description(): string {
    return super.description() + ' ' + this.className;
  }

  public render(): string {
    return Maybe.match((cateName: string) => {
      return `\n@implementation ${this.className} (${cateName})\n\n@end`;
    }, () => {
      return `\n@implementation ${this.className}\n\n@end`;
    }, this.categoryName);
  }
}

export class ProtocolElement extends Element {
  private protocolName: string;
  private baseProtocols: string[];

  constructor(protoName: string, baseProtos = ['NSObject']) {
    super('Protocol');
    this.protocolName = protoName;
    this.baseProtocols = baseProtos;
  }

  public description(): string {
    return super.description() + ' ' + this.protocolName;
  }

  public render(): string {
    return `\n@protocol ${this.protocolName} <${this.baseProtocols.join(', ')}>\n\n@end`
  }
}

export class TypeElement {
  private typeName: string;
  private isReference: boolean;

  public constructor(name: string, isRef = false) {
    this.typeName = name;;
    this.isReference = isRef;
  }

  public render(): string {
    return this.typeName + (this.isReference ? ' *' : '');
  }
}

enum PropertyAtomicKeyword {
  atomic,
  nonatomic
}

enum PropertyNullabilityKeyward {
  nonnull,
  nullable
}

export enum PropertyMemoryKeyword {
  assign,
  copy,
  strong,
  weak
}

enum PropertyReadabilityKeyword {
  readonly,
  readwrite
}

export class PropertyElement extends Element {
  private propertyName: string;
  private propertyType: TypeElement;
  private memoryKeyword: PropertyMemoryKeyword;
  private atomicKeyword: PropertyAtomicKeyword;

  public constructor(name: string, type: TypeElement, memory: PropertyMemoryKeyword) {
    super('Property');
    this.propertyName = name;
    this.propertyType = type;
    this.memoryKeyword = memory;
    this.atomicKeyword = PropertyAtomicKeyword.nonatomic;
  }

  public render(): string {
    const keywords = (() => {
      const array = [];
      array.push(PropertyAtomicKeyword[this.atomicKeyword]);
      array.push(PropertyMemoryKeyword[this.memoryKeyword]);
      return array;
    })();

    return `\n@property (${keywords.join(', ')}) ${this.propertyType.render()} ${this.propertyName};`;
  }
}
