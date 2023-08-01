import type { Configuration } from "webpack";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "node:path";
import { resolveEntries } from "../common/resolver.js";
import {
  CLI_ROOT,
  getDist,
  getScriptwriterConfig,
} from "../common/constant.js";
import { ScriptwriterAssetPlugin } from "../plugins/scriptwriter-asset-plugin.js";
import { getStyleLoader } from "./style-loader.js";

const config = getScriptwriterConfig();

export const webpackBase: Configuration = {
  entry: resolveEntries,

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: getStyleLoader(),
      },
      {
        test: /\.(png|svg|jpe?g|webp|tiff?)$/i,
        type: "asset/resource",
        // use: {
        //   loader: path.resolve(CLI_ROOT, "loaders/image-resize.js"),
        // },
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js", ".tsx", ".css", ".scss"],
    alias: {
      "@mui/icons-material": "@mui/icons-material/esm",
    },
  },

  output: {
    filename: "static/js/[name].[contenthash].js",
    path: getDist(),
    chunkFilename: `static/js/[name].[contenthash].js`,
  },

  plugins: [
    new ScriptwriterAssetPlugin({
      ...config,
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(CLI_ROOT, "../index.html"),
      meta: {
        viewport:
          "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no",
      },
      chunks: ["main"],
      title: config.title,
      favicon: path.resolve(CLI_ROOT, "../favicon.ico"),
    }),
    new webpack.DefinePlugin({
      TITLE: JSON.stringify(config.title),
    }),
  ],
};
