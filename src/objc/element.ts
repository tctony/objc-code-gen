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

export class ClassDeclarationElement extends ElementArrayContainer {
  private className: string;
  private superClassName: string;
  private categoryName: Maybe.Maybe<string>;
  private implementedProtocols: string[];

  public constructor(className: string, superClassName = 'NSObject', categoryName?: string) {
    super('ClassDeclaration');
    this.className = className;
    this.superClassName = superClassName;
    this.categoryName = (categoryName === undefined ? Maybe.Nothing<string>() : Maybe.Just(categoryName));
    this.implementedProtocols = [];
  }

  public implementProtocol(protocol: string): void {
    this.implementedProtocols.push(protocol);
  }

  public addProperty(...properties: PropertyElement[]): void {
    properties.forEach((value) => {
      super.addElement(value);
    });
  }

  public addMethod(methodDecl: MethodDeclarationElement): void {
    super.addElement(methodDecl);
  }

  public addElement(elem: IElement): void {
    if (elem instanceof PropertyElement) {
      this.addProperty(elem);
    } else if (elem instanceof MethodDeclarationElement) {
      this.addMethod(elem);
    } else {
      throw new Error(`invalid elem add to class declaration: ${elem}`);
    }
  }

  public description(): string {
    return super.description() + ' ' + this.className + '@' + this.superClassName;
  }

  public render(): string {
    const protocolString = (this.implementedProtocols.length > 0 ? ` <${this.implementedProtocols.join(', ')}>` : '');
    let bodyString = super.render();
    if (bodyString.length > 0) bodyString += '\n';
    return Maybe.match((cateName: string) => {
      return `\n@interface ${this.className} (${cateName})${protocolString}\n${bodyString}\n@end`;
    }, () => {
      return `\n@interface ${this.className} : ${this.superClassName}${protocolString}\n${bodyString}\n@end`;
    }, this.categoryName);
  }
}

export class ClassImplementationElement extends ElementArrayContainer {
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

  public addMethod(method: MethodImplementationElement): void {
    super.addElement(method);
  }

  public addElement(elem: IElement): void {
    if (elem instanceof MethodImplementationElement) {
      this.addMethod(elem);
    } else {
      throw new Error(`invalid elem add to class implements: ${elem}`);
    }
  }

  public description(): string {
    return super.description() + ' ' + this.className;
  }

  public render(): string {
    let bodyString = super.renderElements();
    if (bodyString.length > 0) bodyString += '\n';
    return Maybe.match((cateName: string) => {
      return `\n@implementation ${this.className} (${cateName})\n${bodyString}\n@end`;
    }, () => {
      return `\n@implementation ${this.className}\n${bodyString}\n@end`;
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

export class Type extends Element {
  private typeName: string;
  private isPointer: boolean;
  private protocols: string[];

  public constructor(name: string, isPointer = false, protocols: string[] = []) {
    super('Type');
    this.typeName = name;;
    this.isPointer = isPointer;
    this.protocols = protocols;
  }

  public render(): string {
    return (this.typeName
      + (this.protocols.length > 0 ? `<${this.protocols.join(', ')}>` : '')
      + (this.isPointer ? ' *' : ''));
  }
}

export module Type {
  export function ValueType(name: string) {
    return new Type(name);
  }

  export function PointerType(name: string) {
    return new Type(name, true);
  }

  export function ProtocolType(proto: string) {
    return new Type('id', false, [proto]);
  }
}


enum PropertyModifierAtomic {
  atomic,
  nonatomic
}

enum PropertyModifierNullability {
  nonnull,
  nullable
}

export enum PropertyModifierMemory {
  assign,
  copy,
  strong,
  weak
}

enum PropertyModifierAccessibility {
  readonly,
  readwrite
}

export class PropertyElement extends Element {
  private propertyName: string;
  private propertyType: Type;
  private memoryKeyword: PropertyModifierMemory;
  private atomicKeyword: PropertyModifierAtomic;

  public constructor(name: string, type: Type, memoryModifier: PropertyModifierMemory) {
    super('Property');
    this.propertyName = name;
    this.propertyType = type;
    this.memoryKeyword = memoryModifier;
    this.atomicKeyword = PropertyModifierAtomic.nonatomic;
  }

  public render(): string {
    const keywords = (() => {
      const array = [];
      array.push(PropertyModifierAtomic[this.atomicKeyword]);
      array.push(PropertyModifierMemory[this.memoryKeyword]);
      return array;
    })();

    return `\n@property (${keywords.join(', ')}) ${this.propertyType.render()} ${this.propertyName};`;
  }
}

// used internally, export for testing
export class _MethodNameComponent implements IElement {
  public constructor(
    private methodName: string,
    private parameterType?: Type,
    private parameterName?: string) { }

  public render(): string {
    if (this.parameterType instanceof Type
      && typeof this.parameterName === 'string') {
      return `${this.methodName}:(${this.parameterType.render()})${this.parameterName}`;
    } else {
      return this.methodName;
    }
  }
}

export class MethodDeclarationElement extends ElementArrayContainer {
  private isClassMethod: boolean;
  private returnType: Type;

  public constructor(isClassMethod: boolean, returnType: Type,
    methodName: string | string[], paramterTypes: Type[] = [], paramterNames: string[] = []) {
    super('MethodDeclaration');
    this.isClassMethod = isClassMethod;
    this.returnType = returnType;
    if (typeof methodName === 'string') {
      this.addElement(new _MethodNameComponent(methodName));
    } else {
      methodName.forEach((name: string, index: number) => {
        const pt = paramterTypes[index];
        const pn = paramterNames[index];
        if (pt === undefined || pn === undefined) {
          throw new Error('method name and parameter mismatch');
        }
        else {
          this.addElement(new _MethodNameComponent(name, pt, pn));
        }
      });
    }
  }

  public addElement(elem: IElement): void {
    if (elem instanceof _MethodNameComponent) {
      super.addElement(elem);
    } else {
      throw new Error(`invalid element add to method declaration: ${elem}`);
    }
  }

  public render(): string {
    return '\n'
      + (this.isClassMethod ? '+' : '-')
      + ` (${this.returnType.render()})`
      + super.renderElements(' ')
      + ';';
  }
}

export class MethodImplementationElement extends ElementArrayContainer {
  private methodDeclaration: MethodDeclarationElement;

  public constructor(declaration: MethodDeclarationElement, codes: CodeElement[] = []) {
    super('Method', codes);
    this.methodDeclaration = declaration;
  }

  public addElement(elem: IElement): void {
    if (elem instanceof CodeElement) {
      super.addElement(elem);
    } else {
      throw new Error(`invalid element add to method implementation: ${elem}`);
    }
  }

  public render(): string {
    return this.methodDeclaration.render().replace(';', '\n{\n')
      + super.renderElements()
      + '\n}';
  }
}

export class CodeElement extends Element {
  public render(): string {
    return '';
  }
}
