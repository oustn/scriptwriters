import { merge } from "webpack-merge";
import WebpackBar from "webpackbar";
import type { Configuration } from "webpack";

import { webpackBase } from "./webpack.base.js";
import { GREEN, ASSETS } from "../common/constant.js";
import { getWebpackConfig } from "../common/helper.js";
import { WebpackConfig } from "../common/types";

function getDevBaseConfig(): Configuration {
  return merge(webpackBase, {
    mode: "development",

    devtool: "inline-cheap-source-map",

    stats: "errors-only",

    infrastructureLogging: {
      level: "error",
    },

    devServer: {
      port: 8080,
      host: "0.0.0.0",
      headers: {
        "Cache-Control": "no-store",
      },
      // hot: false,
      // liveReload: false,
      // webSocketServer: false,
      static: {
        directory: ASSETS,
        publicPath: "/assets",
      },
    },

    plugins: [
      new WebpackBar({
        name: "Scriptwriter Cli",
        color: GREEN,
      }),
    ],

    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  });
}

export function getDevConfig(): WebpackConfig {
  return getWebpackConfig(getDevBaseConfig());
}
