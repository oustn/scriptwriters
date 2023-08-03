// eslint-disable @typescript-eslint/no-explicit-any
export type GenericTraps = {
  [key: string | symbol]: unknown;
};

export type RequestLike = {
  method: string;
  url: string;
  query: {
    [key: string]: unknown | unknown[];
  };
} & GenericTraps;

export type IRequestStrict = {
  method: string;
  url: string;
  route: string;
  params: {
    [key: string | symbol]: string;
  };
  query: {
    [key: string]: string | string[] | undefined;
  };
  proxy?: unknown;
} & Request;

export type IRequest = IRequestStrict & GenericTraps;

export type RouterOptions = {
  base?: string;
  routes?: RouteEntry[];
};

export type RouteHandler<I = IRequest, A extends unknown[] = unknown[]> = {
  (request: I, ...args: A): unknown;
};

export type RouteEntry = [string, RegExp, RouteHandler[], string];

// this is the generic "Route", which allows per-route overrides
export type Route = <
  RequestType = IRequest,
  Args extends unknown[] = unknown[],
  RT = RouterType,
>(
  path: string,
  ...handlers: RouteHandler<RequestType, Args>[]
) => RT;

// this is an alternative UniversalRoute, accepting generics (from upstream), but without
// per-route overrides
export type UniversalRoute<
  RequestType = IRequest,
  Args extends unknown[] = unknown[],
> = (
  path: string,
  ...handlers: RouteHandler<RequestType, Args>[]
) => RouterType<UniversalRoute<RequestType, Args>, Args>;

// helper function to detect equality in types (used to detect custom Request on router)
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

export type CustomRoutes<R = Route> = {
  [key: string]: R;
};

export type RouterType<R = Route, Args extends unknown[] = unknown[]> = {
  __proto__: RouterType<R>;
  routes: RouteEntry[];
  handle: <A extends unknown[] = Args>(
    request: RequestLike,
    ...extra: Equal<R, Args> extends true ? A : Args
  ) => Promise<unknown>;
  all: R;
  delete: R;
  get: R;
  head: R;
  options: R;
  patch: R;
  post: R;
  put: R;
} & CustomRoutes<R>;

export const Router = <
  RequestType = IRequest,
  Args extends unknown[] = unknown[],
  RouteType = Equal<RequestType, IRequest> extends true
    ? Route
    : UniversalRoute<RequestType, Args>,
>({ base = "", routes = [] }: RouterOptions = {}): RouterType<
  RouteType,
  Args
> => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  __proto__: new Proxy({} as unknown as IRequest, {
    // @ts-expect-error (we're adding an expected prop "path" to the get)
    get:
      (target: IRequest, prop: string, receiver: object, path: string) =>
      // @ts-expect-error (we're adding an expected prop "path" to the get)
      (route: string, ...handlers: RouteHandler<I>[]) =>
        routes.push([
          prop.toUpperCase(),
          RegExp(
            `^${
              (path = (base + route).replace(/\/+(\/|$)/g, "$1")) // strip double & trailing splash
                .replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))") // greedy params
                .replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))") // named params and image format
                .replace(/\./g, "\\.") // dot in path
                .replace(/(\/?)\*/g, "($1.*)?") // wildcard
            }/*$`,
          ),
          handlers, // embed handlers
          path, // embed clean route path
        ]) && receiver,
  }),
  routes,
  async handle(request: RequestLike, ...args) {
    let response, match;
    const url = new URL(request.url),
      query: RequestLike["query"] = (request.query = { __proto__: "" });
    for (const [k, v] of url.searchParams) {
      query[k] = query[k] === undefined ? v : [query[k], v].flat();
    }
    for (const [method, regex, handlers, path] of routes) {
      if (
        (method === request.method || method === "ALL") &&
        (match = url.pathname.match(regex))
      ) {
        request.params = match.groups || {}; // embed params in request
        request.route = path; // embed route path in request
        for (const handler of handlers) {
          if (
            (response = await handler(
              (request.proxy || request) as IRequest,
              ...args,
            )) !== undefined
          )
            return response;
        }
      }
    }
  },
});
