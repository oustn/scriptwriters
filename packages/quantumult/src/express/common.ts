import { METHODS } from "http";

export const BASIC_METHODS = [
  "get",
  "post",
  "put",
  "head",
  "delete",
  "options",
  "trace",
  "copy",
  "lock",
  "mkcol",
  "move",
  "purge",
  "propfind",
  "proppatch",
  "unlock",
  "report",
  "mkactivity",
  "checkout",
  "merge",
  "m-search",
  "notify",
  "subscribe",
  "unsubscribe",
  "patch",
  "search",
  "connect"
] as const;

export type Method = (typeof BASIC_METHODS)[number];

export type MethodHandler<T> = {
  [key in Method]: T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BindHttpMethod<K>(fn: K): ClassDecorator {
  return function BindHttpMethod<
    T extends {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new(...args: any[]): object;
    },
  >(Base: T): T & MethodHandler<K> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return class extends Base implements MethodHandler<K> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args);
        BASIC_METHODS.forEach((method: Method) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (this as MethodHandler<K>)[method] = (...args) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (fn as { (...args: any[]): any }).call(
              this,
              method,
              ...args
            );
          };
        });
      }
    };
  } as { (): void };
}
