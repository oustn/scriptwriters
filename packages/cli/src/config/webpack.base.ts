import type { Configuration } from "webpack";
import { resolveEntries } from "../common/resolver.js";
import { getDist, getScriptwriterConfig } from "../common/constant.js";
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
  ],
};
