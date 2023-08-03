/**
 * @script task
 * @corn 0 12 * * 1
 * @tag 测试Demo
 * @icon /assets/icons/mt.png
 * @description 测试Demo
 */

import { call, fetch } from "@scriptwriter/quantumult";
import { Router } from "@scriptwriter/quantumult/router";

const router = Router();

router.all("*", () => {
  console.log("all");
});

call(async () => {
  await fetch("https://scriptwriter.io/wxwork", {});
});
