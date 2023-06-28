import type { Configuration } from "webpack";
import { resolveEntries } from "../common/resolver.js";
import { getDist, getScriptwriterConfig } from "../common/constant.js";
import { ScriptwriterPlugin } from "../plugins/scriptwriter-plugin.js";

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
    extensions: [".ts", ".js"],
  },

  output: {
    filename: "[name].js",
    path: getDist(),
  },

  plugins: [
    new ScriptwriterPlugin({
      name: config.name,
      description: config.description,
      host: config.host || "/",
      taskSubscribe: config.taskSubscribe || "tasks.json",
      rewriteSubscribe: config.rewriteSubscribe || "rewrites.conf",
    }),
  ],
};
