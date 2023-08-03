/**
 * 打开企业微信
 * @version 1.0.0
 * @script rewrite
 * @host scriptwriter.io
 * @url ^https?:\/\/scriptwriter\.io\/wxwork$
 * @method ^GET
 * @rewrite script-analyze-echo-response
 * @description 打开企业微信
 */

import { call, logger } from "@scriptwriter/quantumult";

declare const $request: any;

call(async () => {
  logger.info($request);
  return {
    status: "HTTP/1.1 201",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  };
});
