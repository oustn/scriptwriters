/**
 * @script task
 * @corn 0 12 * * 1
 * @tag 测试Demo
 * @icon /assets/icons/mt.png
 * @description 测试Demo
 */

import { call, fetch } from "@scriptwriter/quantumult";

call(async () => {
  await fetch("https://scriptwriter.io/wxwork");
});
