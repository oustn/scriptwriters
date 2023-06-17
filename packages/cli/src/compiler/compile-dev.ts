import chalk from "chalk";
import { getPort } from "portfinder";
import WebpackDevServer from "webpack-dev-server";
import webpack from "webpack";

import { getDevConfig } from "../config/webpack.dev.js";
import { GREEN } from "../common/constant.js";

function logServerInfo(port: number) {
  const ip = WebpackDevServer.internalIPSync("v4");

  const local = `http://localhost:${port}/`;

  console.log("\n  Site running at:\n");
  console.log(`  ${chalk.bold("Local")}:    ${chalk.hex(GREEN)(local)} `);
  if (ip) {
    const network = `http://${ip}:${port}/`;
    console.log(`  ${chalk.bold("Network")}:  ${chalk.hex(GREEN)(network)}`);
  }
}

function runDevServer(port: number, config: ReturnType<typeof getDevConfig>) {
  const server = new WebpackDevServer(
    {
      ...config.devServer,
      port,
    },
    webpack(config)
  );

  // this is a hack to disable wds status log
  // (server).showStatus = function () {};

  server.start().catch((err) => {
    console.log(err);
  });
}

export async function compileDev() {
  const config = getDevConfig();

  getPort(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      port: config.devServer!.port as number,
    },
    (err, port) => {
      if (err) {
        console.log(err);
        return;
      }

      logServerInfo(port);
      runDevServer(port, config);
    }
  );
}
