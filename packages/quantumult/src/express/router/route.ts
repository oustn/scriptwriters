import { Layer } from "./layer";
import { ErrorRequestHandler, Handler } from "express";
import { BindHttpMethod, Method, MethodHandler } from "../common";

@BindHttpMethod(function (
  this: Route,
  method: Method,
  ...handles: Array<Handler | ErrorRequestHandler>
) {
  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];

    if (typeof handle !== "function") {
      const type = toString.call(handle);
      const msg =
        "Route." + method + "() requires a callback function but got a " + type;
      throw new Error(msg);
    }

    const layer = new Layer("/", {}, handle);
    layer.method = method;

    this.methods[method] = true;
    this.stack.push(layer);
  }

  return this;
})
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class Route
  implements
    MethodHandler<{ (...args: Array<Handler | ErrorRequestHandler>): Route }>
{
  private stack: Layer[] = [];

  private methods: Record<string, boolean> = {};

  constructor(private path: string) {}

  private _handles_method(method: string) {}

  private _options() {}

  dispatch() {}

  all(...handles: Array<Handler | ErrorRequestHandler>) {
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];

      if (typeof handle !== "function") {
        const type = toString.call(handle);
        const msg = `Route.all() requires a callback function but got a ${type}`;
        throw new TypeError(msg);
      }

      const layer = new Layer("/", {}, handle);
      layer.method = undefined;

      this.methods._all = true;
      this.stack.push(layer);
    }

    return this;
  }
}
