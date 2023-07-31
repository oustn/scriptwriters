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

import { call } from "@scriptwriter/quantumult";

call(async () => {
  return {
    status: "HTTP/1.1 301",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Location: "wxwork://message",
    },
  };
});
