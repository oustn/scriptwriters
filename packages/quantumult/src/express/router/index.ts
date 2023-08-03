import type {
  IRouter,
  RequestHandler,
  RequestParamHandler,
  RouterOptions,
} from "express";

export * from "./route";

interface RouterProto {
  params: { [key: string]: RequestParamHandler[] };
  caseSensitive?: boolean;
  mergeParams?: boolean;
  strict?: boolean;
}

interface Router extends IRouter, RouterProto {}

function Router(options?: RouterOptions): IRouter {
  const opts = options || {};

  const router: IRouter & RouterProto = (req, res, next) => {
    router.handle(req, res, next);
  };

  Object.setPrototypeOf(router, Router);

  router.params = {};
  router.caseSensitive = opts.caseSensitive;
  router.mergeParams = opts.mergeParams;
  router.strict = opts.strict;
  router.stack = [];

  return router;
}

Router.param = function (
  this: Router,
  name: string,
  handler: RequestParamHandler,
) {
  (this.params[name] = this.params[name] || []).push(handler);
  return this;
};

Router.handle = function (this: Router, req, res, out) {
  const self = this;
  const idx = 0;
  const protohost = getProtohost(req.url) || "";
  const removed = "";
  const slashAdded = false;
  const sync = 0;
  const paramcalled = {};

  // only used if OPTIONS request
  const options = [];

  // middleware and routes
  const stack = self.stack;

  // manage inter-router variables
  const parentParams = req.params;
  const parentUrl = req.baseUrl || "";
  let done = restore(out, req as unknown as Record<string, unknown>, "baseUrl", "next", "params");

  // setup next layer
  req.next = next;

  // for options requests, respond with a default if nothing else responds
  if (req.method === "OPTIONS") {
    done = wrap(done, function (old, err) {
      if (err || options.length === 0) return old(err);
      sendOptionsResponse(res, options, old);
    });
  }

  // setup basic req values
  req.baseUrl = parentUrl;
  req.originalUrl = req.originalUrl || req.url;

  next();

  function next(err) {
    var layerError = err === "route" ? null : err;

    // remove added slash
    if (slashAdded) {
      req.url = req.url.slice(1);
      slashAdded = false;
    }

    // restore altered req.url
    if (removed.length !== 0) {
      req.baseUrl = parentUrl;
      req.url = protohost + removed + req.url.slice(protohost.length);
      removed = "";
    }

    // signal to exit router
    if (layerError === "router") {
      setImmediate(done, null);
      return;
    }

    // no more matching layers
    if (idx >= stack.length) {
      setImmediate(done, layerError);
      return;
    }

    // max sync stack
    if (++sync > 100) {
      return setImmediate(next, err);
    }

    // get pathname of request
    var path = getPathname(req);

    if (path == null) {
      return done(layerError);
    }

    // find next matching layer
    var layer;
    var match;
    var route;

    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;

      if (typeof match !== "boolean") {
        // hold on to layerError
        layerError = layerError || match;
      }

      if (match !== true) {
        continue;
      }

      if (!route) {
        // process non-route handlers normally
        continue;
      }

      if (layerError) {
        // routes do not match with a pending error
        match = false;
        continue;
      }

      var method = req.method;
      var has_method = route._handles_method(method);

      // build up automatic options response
      if (!has_method && method === "OPTIONS") {
        appendMethods(options, route._options());
      }

      // don't even bother matching route
      if (!has_method && method !== "HEAD") {
        match = false;
      }
    }

    // no match
    if (match !== true) {
      return done(layerError);
    }

    // store route for dispatch on change
    if (route) {
      req.route = route;
    }

    // Capture one-time layer values
    req.params = self.mergeParams
      ? mergeParams(layer.params, parentParams)
      : layer.params;
    var layerPath = layer.path;

    // this should be done for the layer
    self.process_params(layer, paramcalled, req, res, function (err) {
      if (err) {
        next(layerError || err);
      } else if (route) {
        layer.handle_request(req, res, next);
      } else {
        trim_prefix(layer, layerError, layerPath, path);
      }

      sync = 0;
    });
  }
} as RequestHandler;

function getProtohost(url: string | unknown) {
  if (typeof url !== "string" || url.length === 0 || url[0] === "/") {
    return undefined;
  }

  const searchIndex = url.indexOf("?");
  const pathLength = searchIndex !== -1 ? searchIndex : url.length;
  const fqdnIndex = url.slice(0, pathLength).indexOf("://");

  return fqdnIndex !== -1
    ? url.substring(0, url.indexOf("/", 3 + fqdnIndex))
    : undefined;
}

function restore<T extends (...args: unknown[]) => unknown>(
  fn: T,
  obj: Record<string, unknown>,
  ...props: string[]
) {
  const vals = props.map((prop) => obj[prop]);

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    // restore vals
    for (let i = 0; i < props.length; i++) {
      obj[props[i]] = vals[i];
    }

    return fn.apply(this, args);
  };
}
