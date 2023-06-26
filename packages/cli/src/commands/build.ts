import { remove, copy, exists } from "fs-extra";
import { consola } from "consola";
import { execa } from "execa";

import { setNodeEnv } from "../common/helper.js";
import { compile } from "../compiler/compile.js";
import { getDist, ASSETS } from "../common/constant.js";

async function clean() {
  await remove(getDist());
}

async function installDependencies() {
  consola.info("Install Dependencies\n");

  try {
    const manager = "npm";

    await execa(manager, ["install", "--prod=false"], {
      stdio: "inherit",
    });

    console.log("");
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function build() {
  setNodeEnv("production");
  await clean();
  await installDependencies();
  await compile();
  if (await exists(ASSETS)) {
    await copy(ASSETS, getDist("assets"));
  }
}
