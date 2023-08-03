/**
 * 测试Express
 * @script task
 * @corn 0 12 * * 1
 * @tag 测试Express
 * @icon /assets/icons/mt.png
 * @description 测试Express
 */

import express, { Route } from "@scriptwriter/quantumult/express";
import { call } from "@scriptwriter/quantumult";

call(async () => {
  console.log("aa");
  const app = express();
  const route = new Route('/')
  route.get(() => {})

  console.log(app);
});
