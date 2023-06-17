// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Headers, Request, Response } from "whatwg-fetch";
import { logger } from "./log";

function fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return new Promise(function (resolve, reject) {
    const request = new Request(input, init);

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    logger.log(`Fetch ${request.url}`);

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
        logger.log(
          `Fetch ${request.url} success with ${statusCode} ${statusText}`
        );
        resolve(
          new Response(body, {
            status: statusCode,
            statusText,
            headers,
          })
        );
      })
      .catch((error: unknown) => {
        logger.error(
          `Fetch ${request.url} failed: ${
            (error as Error).message || (error as { error: string }).error
          }`
        );
        reject(
          new TypeError(
            `Network request failed: ${
              (error as Error).message || (error as { error: string }).error
            }`
          )
        );
      });
  });
}

export { Headers, Request, Response, fetch };
