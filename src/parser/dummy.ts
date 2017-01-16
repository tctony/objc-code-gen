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
    const otherClassName = 'OtherClass';
    const protocolName = className + 'Delegate';
    const categoryName = 'category';
    const subClassName = 'Sub' + className;
    const hfile = ObjC.File.h(file);
    const mfile = ObjC.File.m(file);

    hfile.addElement(new ObjC.ImportElement('Foundation', 'Foundation', ObjC.ImportType.Std));
    hfile.addElement(new ObjC.ForwardDeclarationElement.ClassForwardDecl(otherClassName));
    hfile.addElement(new ObjC.ForwardDeclarationElement.ProtocolForwardDecl(protocolName));
    const classDecl = new ObjC.ClassDeclarationElement(className);
    classDecl.implementProtocol('NSObject');
    hfile.addElement(classDecl);
    hfile.addElement(new ObjC.ClassDeclarationElement(className, undefined, categoryName));
    hfile.addElement(new ObjC.ClassDeclarationElement(subClassName, className));
    hfile.addElement(new ObjC.ProtocolElement(protocolName));

    mfile.addElement(new ObjC.ImportElement(className));
    mfile.addElement(new ObjC.ClassImplementationElement(className));
    mfile.addElement(new ObjC.ClassImplementationElement(className, categoryName));
    mfile.addElement(new ObjC.ClassImplementationElement(subClassName));

    const out = <Factory.Out>this;
    out.push(hfile);
    out.push(mfile);
  });

}
