import { merge } from "webpack-merge";
import WebpackBar from "webpackbar";

import type { Configuration } from "webpack";

import { webpackBase } from "./webpack.base.js";
import { GREEN } from "../common/constant.js";
import { getWebpackConfig } from "../common/helper.js";
import { WebpackConfig } from "../common/types";

function getDevBaseConfig(): Configuration {
  return merge(webpackBase, {
    mode: "development",
    devServer: {
      port: 8080,
      host: "0.0.0.0",
      headers: {
        "Cache-Control": "no-store",
      },
      hot: false,
      liveReload: false,
      webSocketServer: false,
    },

    plugins: [
      new WebpackBar({
        name: "Scriptwriter Cli",
        color: GREEN,
      }),
    ],
  });
}

export function getDevConfig(): WebpackConfig {
  return getWebpackConfig(getDevBaseConfig());
}
