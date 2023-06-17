import type { Configuration } from "webpack";
import { resolveEntries } from "../common/resolver.js";
import { resolve } from "../common/constant.js";

export const webpackBase: Configuration = {
  entry: resolveEntries,

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },

  output: {
    filename: "[name].js",
    path: resolve("dist"),
  },
};
