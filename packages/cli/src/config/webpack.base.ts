import type { Configuration } from "webpack";

export const webpackBase: Configuration = {
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
  },
};
