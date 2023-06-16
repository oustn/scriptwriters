import { setNodeEnv } from "../common/helper.js";
import { ROOT } from "../common/constant.js";
import { compileDev } from "../compiler/compile-dev.js";

export async function dev() {
  setNodeEnv("development");
  console.log("dev", ROOT);
  await compileDev();
}
