import { remove, copy, exists } from "fs-extra";
import { consola } from "consola";
import { execa } from "execa";

import { setNodeEnv } from "../common/helper.js";
import { compile } from "../compiler/compile.js";
import {
  getDist,
  ASSETS,
  getScriptwriterConfig,
  resolve,
} from "../common/constant.js";

async function clean() {
  await remove(getDist());
}

async function installDependencies() {
  consola.info("Install Dependencies\n");

  try {
    const manager = "npm";

    await execa(manager, ["install", "--include=dev"], {
      stdio: "inherit",
    });

    console.log("");
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function processCustomCopy() {
  consola.info("Copy Custom Files\n");
  const config = getScriptwriterConfig();
  if (Array.isArray(config?.copyWithin)) {
    return Promise.all(
      config.copyWithin.map(
        async ({ from, to }: { from: string; to: string }) => {
          const fromDist = resolve(from);
          const toDist = getDist(to);
          if (await exists(fromDist)) {
            await copy(fromDist, toDist);
          }
        },
      ),
    );
  }
}

export async function build(skipInstall: boolean) {
  setNodeEnv("production");
  await clean();
  if (!skipInstall) {
    await installDependencies();
  }
  try {
    await compile();
  } catch (e) {
    consola.error(e);
    process.exit(1);
  }
  if (await exists(ASSETS)) {
    await copy(ASSETS, getDist("assets"));
  }
  await processCustomCopy();
}
