/**
 * Express app demo
 * @description Run as an express app
 * @script rewrite
 * @host scriptwriter.app
 * @url ^https?:\/\/scriptwriter\.app
 * @rewrite script-analyze-echo-response
 */

import { call } from "@scriptwriter/quantumult";

call(async () => {
  console.log("aa");
});
