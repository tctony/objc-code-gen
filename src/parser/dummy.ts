/// <reference path="./../../typings/index.d.ts" />

import * as Factory from './factory';
import * as vf from 'vinyl';
import * as ObjC from '../objc';

/**
 * Dummy Parser create hard coded `ObjC.File` from dummy input file for develop or test purpose;
 */
export function DummyParser() {
  return Factory.createParser(function (file: vf) {
    const className = file.stem;
    const propertyName = 'property';
    const methodname = 'methodName';
    const parameterType = ObjC.Type.PointerType('NSString');
    const parameterName = 'parameterName';
    const otherClassName = 'OtherClass';
    const protocolName = className + 'Delegate';
    const categoryName = 'category';
    const subClassName = 'Sub' + className;
    const hfile = ObjC.File.h(file);
    const mfile = ObjC.File.m(file);

    hfile.addElement(new ObjC.ImportElement('Foundation', 'Foundation', ObjC.ImportType.Std));
    hfile.addElement(new ObjC.ForwardDeclarationElement.ClassForwardDecl(otherClassName));
    hfile.addElement(new ObjC.ForwardDeclarationElement.ProtocolForwardDecl(protocolName));
    hfile.addElement((() => {
      const classDecl = new ObjC.ClassDeclarationElement(className);
      classDecl.implementProtocol('NSObject');
      classDecl.addProperty(new ObjC.PropertyElement(propertyName, ObjC.Type.ValueType('int'), ObjC.PropertyModifierMemory.assign));
      classDecl.addProperty(new ObjC.PropertyElement('delegate', ObjC.Type.ProtocolType(protocolName), ObjC.PropertyModifierMemory.weak));
      classDecl.addMethod(new ObjC.MethodDeclarationElement(false, ObjC.Type.ValueType('void'), methodname));
      classDecl.addMethod(new ObjC.MethodDeclarationElement(false, ObjC.Type.ValueType('void'), [methodname], [parameterType], [parameterName]));
      return classDecl;
    })());
    hfile.addElement(new ObjC.ClassDeclarationElement(className, undefined, categoryName));
    hfile.addElement(new ObjC.ClassDeclarationElement(subClassName, className));
    hfile.addElement(new ObjC.ProtocolElement(protocolName));

    mfile.addElement(new ObjC.ImportElement(className));
    mfile.addElement((() => {
      const classImp = new ObjC.ClassImplementationElement(className);
      classImp.addMethod((() => {
        const d = new ObjC.MethodDeclarationElement(false, ObjC.Type.ValueType('void'), methodname);
        return new ObjC.MethodImplementationElement(d);
      })());
      classImp.addMethod((() => {
        const d = new ObjC.MethodDeclarationElement(false, ObjC.Type.ValueType('void'), [methodname], [parameterType], [parameterName]);
        return new ObjC.MethodImplementationElement(d);
      })());
      return classImp;
    })());
    mfile.addElement(new ObjC.ClassImplementationElement(className, categoryName));
    mfile.addElement(new ObjC.ClassImplementationElement(subClassName));

    const out = <Factory.Out>this;
    out.push(hfile);
    out.push(mfile);
  });

}
