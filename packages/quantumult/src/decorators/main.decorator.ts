import "reflect-metadata";

import { MainMethod } from "./keys";

export function Main(): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata(MainMethod, true, descriptor.value);
  };
}
