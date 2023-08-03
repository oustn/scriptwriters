import { IRequest } from "./Router";

export const withParams = (request: IRequest): void => {
  request.proxy = new Proxy(request.proxy || request, {
    get: (obj: IRequest, prop) => {
      let p;
      if ((p = obj[prop]) !== undefined) {
        if (typeof p === "function") {
          return p?.bind?.(request);
        }
        return p;
      }

      return obj?.params?.[prop];
    },
  });
};
