// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { Headers, Request, Response } from "whatwg-fetch";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  Request as FetchRequest,
  Response as FetchResponse,
} from "whatwg-fetch";
export function fetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  return new Promise(function (resolve, reject) {
    const request = new FetchRequest(input, init);

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value: string, name: string) => {
      headers[name] = value;
    });

    $task
      .fetch({
        url: request.url,
        method: request.method,
        headers,
        body: request._bodyInit ?? null,
        mode: request.mode,
        credentials: request.credentials,
      })
      .then((data) => {
        const { statusCode, statusText, headers, body } = data;
        resolve(
          new FetchResponse(body, {
            status: statusCode,
            statusText,
            headers,
          }),
        );
      })
      .catch((error: unknown) => {
        reject(
          new TypeError(
            `Network request failed: ${
              (error as Error).message || (error as { error: string }).error
            }`,
          ),
        );
      });
  });
}

type CredentialsType = "omit" | "same-origin" | "include";

type ModeType = "same-origin" | "no-cors" | "cors" | "navigate";

type ResponseType = "default" | "error";

type BodyInit = string | URLSearchParams | FormData | Blob | ArrayBuffer;

type RequestInfo = Request | URL | string;

type RequestOptions = {
  body?: BodyInit;

  credentials?: CredentialsType;
  headers?: HeadersInit;
  method?: string;
  mode?: string;
  referrer?: string;
  signal?: AbortSignal;
};

type ResponseOptions = {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
};

type HeadersInit = Headers | { [key: string]: string };

// https://github.com/facebook/flow/blob/f68b89a5012bd995ab3509e7a41b7325045c4045/lib/bom.js#L902-L914
declare class Headers {
  "@@iterator"(): Iterator<[string, string]>;
  constructor(init?: HeadersInit);
  append(name: string, value: string): void;
  delete(name: string): void;
  entries(): Iterator<[string, string]>;
  get(name: string): null | string;
  has(name: string): boolean;
  keys(): Iterator<string>;
  set(name: string, value: string): void;
  values(): Iterator<string>;
  forEach(
    fn: (value: string, name: string, headers: Headers) => unknown,
    thisArg?: Headers,
  ): void;
}

// https://github.com/facebook/flow/blob/f68b89a5012bd995ab3509e7a41b7325045c4045/lib/bom.js#L994-L1018
// unsupported in polyfill:
// - cache
// - integrity
// - redirect
// - referrerPolicy
declare class Request {
  constructor(input: RequestInfo, init?: RequestOptions | RequestInit);
  clone(): Request;

  url: string;

  credentials: CredentialsType;
  headers: Headers;
  method: string;
  referrer: string;
  signal?: AbortSignal;

  // Body methods and attributes
  bodyUsed: boolean;

  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<unknown>;
  text(): Promise<string>;
  mode: ModeType;
  _bodyInit: string;
}

declare class Response {
  constructor(input?: BodyInit, init?: ResponseOptions);
  clone(): Response;
  static error(): Response;
  static redirect(url: string, status?: number): Response;

  type: ResponseType;
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;

  // Body methods and attributes
  bodyUsed: boolean;

  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

declare class DOMException extends Error {
  constructor(message?: string, name?: string);
}
