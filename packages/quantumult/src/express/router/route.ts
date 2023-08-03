import { Layer } from "./layer";
import type { ErrorRequestHandler, Handler, RequestHandler } from "express";
import { BindHttpMethod, Method, MethodHandler } from "../common";

export interface Route
  extends MethodHandler<{
    (...args: Array<Handler | ErrorRequestHandler>): Route;
  }> {
  all(...handles: Array<Handler | ErrorRequestHandler>): Route;
}

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
export class Route {
  private stack: Layer[] = [];

  private methods: Record<string, boolean> = {};

  constructor(private path: string) {}

  private _handles_method(method: string) {
    if (this.methods._all) {
      return true;
    }
    let name = method.toLowerCase();

    if (name === "head" && !this.methods["head"]) {
      name = "get";
    }

    return Boolean(this.methods[name]);
  }

  private _options() {
    const methods = Object.keys(this.methods);

    // append automatic head
    if (this.methods.get && !this.methods.head) {
      methods.push("head");
    }

    for (let i = 0; i < methods.length; i++) {
      // make upper case
      methods[i] = methods[i].toUpperCase();
    }

    return methods;
  }

  dispatch(
    req: Parameters<RequestHandler>[0],
    res: Parameters<RequestHandler>[1],
    done: (err?: string) => void,
  ) {
    let idx = 0;
    const stack = this.stack;
    let sync = 0;

    if (stack.length === 0) {
      return done();
    }

    let method = req.method.toLowerCase();

    if (method === "head" && !this.methods["head"]) {
      method = "get";
    }

    req.route = this;

    next();

    function next(err?: string) {
      // signal to exit route
      if (err && err === "route") {
        done();
        return;
      }

      // signal to exit router
      if (err && err === "router") {
        done(err);
        return;
      }

      // max sync stack
      if (++sync > 100) {
        setImmediate(next, err);
        return;
      }

      const layer = stack[idx++];

      // end of layers
      if (!layer) {
        done(err);
        return;
      }

      if (layer.method && layer.method !== method) {
        next(err);
      } else if (err) {
        layer.handle_error(err, req, res, next);
      } else {
        layer.handle_request(req, res, next);
      }

      sync = 0;
    }
  }

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
