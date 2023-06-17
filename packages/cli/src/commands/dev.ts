import { setNodeEnv } from "../common/helper.js";
import { compileDev } from "../compiler/compile-dev.js";

export async function dev() {
  setNodeEnv("development");
  await compileDev();
}
