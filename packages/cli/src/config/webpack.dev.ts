import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import WebpackBar from "webpackbar";
import path from "node:path";

import type { Configuration } from "webpack";

import { webpackBase } from "./webpack.base.js";
import { GREEN, ASSETS, CLI_ROOT } from "../common/constant.js";
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
      new HtmlWebpackPlugin({
        template: path.resolve(CLI_ROOT, "../index.html"),
        meta: {
          viewport:
            "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no",
        },
        chunks: ["main"],
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
