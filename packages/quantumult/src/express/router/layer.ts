import type { Handler, ErrorRequestHandler } from "express";
import { pathToRegexp } from "path-to-regexp";
import type { Key } from "path-to-regexp";
import { BASIC_METHODS } from "../common";

interface ParseOptions {
  sensitive?: boolean;

  strict?: boolean;

  end?: boolean;
}

function decode_param(val: unknown): string {
  if (typeof val !== "string" || val.length === 0) {
    return `${val}`;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = "Failed to decode param '" + val + "'";
      // err.status = err.statusCode = 400;
    }

    throw err;
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export class Layer {
  private name: string;
  private regexp: RegExp & { fast_star?: boolean; fast_slash?: boolean };
  private keys: Key[] = [];
  private path?: string;
  private params?: Record<string, string>;
  method?: (typeof BASIC_METHODS)[number];

  constructor(
    path: string,
    options: ParseOptions,
    private handle: Handler | ErrorRequestHandler,
  ) {
    this.name = handle.name || "<anonymous>";
    this.params = undefined;
    this.path = undefined;
    this.regexp = pathToRegexp(path, this.keys, options);

    // set fast path flags
    this.regexp.fast_star = path === "*";
    this.regexp.fast_slash = path === "/" && options.end === false;
  }

  match(path: string) {
    let match;

    if (path != null) {
      // fast path non-ending match for / (any path matches)
      if (this.regexp.fast_slash) {
        this.params = {};
        this.path = "";
        return true;
      }

      // fast path for * (everything matched in a param)
      if (this.regexp.fast_star) {
        this.params = { "0": decode_param(path) };
        this.path = path;
        return true;
      }

      // match the path
      match = this.regexp.exec(path);
    }

    if (!match) {
      this.params = undefined;
      this.path = undefined;
      return false;
    }

    // store values
    this.params = {};
    this.path = match[0];

    const keys = this.keys;
    const params = this.params;

    for (let i = 1; i < match.length; i++) {
      const key = keys[i - 1];
      const prop = key.name;
      const val = decode_param(match[i]);

      if (val !== undefined || !hasOwnProperty.call(params, prop)) {
        params[prop] = val;
      }
    }

    return true;
  }

  handle_request: Handler = (req, res, next) => {
    const fn = this.handle;

    if (fn.length > 3) {
      // not a standard request handler
      return next();
    }

    try {
      (fn as Handler)(req, res, next);
    } catch (err) {
      next(err);
    }
  };

  handle_error: ErrorRequestHandler = (error, req, res, next) => {
    const fn = this.handle;

    if (fn.length !== 4) {
      // not a standard error handler
      return next(error);
    }

    try {
      (fn as ErrorRequestHandler)(error, req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
