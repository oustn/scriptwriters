/**
 * Express app demo
 * @description Run as an express app
 * @script rewrite
 * @host scriptwriter.app
 * @url ^https?:\/\/scriptwriter\.app
 * @rewrite script-analyze-echo-response
 */

import express from "@scriptwriter/quantumult/express";
import { call } from "@scriptwriter/quantumult";

call(async () => {
  console.log("aa");
  const app = express();
  console.log(app);
});
