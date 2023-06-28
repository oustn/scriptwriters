import type { Configuration } from "webpack";
import { resolveEntries } from "../common/resolver.js";
import { getDist, getScriptwriterConfig } from "../common/constant.js";
import { ScriptwriterAssetPlugin } from "../plugins/scriptwriter-asset-plugin.js";

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
    ],
  },

  resolve: {
    extensions: [".ts", ".js", ".tsx"],
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
  ],
};
