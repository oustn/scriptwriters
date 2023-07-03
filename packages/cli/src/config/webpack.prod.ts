import { merge } from "webpack-merge";
import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { WebpackConfig } from "../common/types";
import { getWebpackConfig } from "../common/helper.js";
import { getDevConfig } from "./webpack.dev.js";
import { getStyleLoader } from "./style-loader.js";

export function getProdConfig(): WebpackConfig {
  return getWebpackConfig(
    merge(getDevConfig(), {
      mode: "production",
      module: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: getStyleLoader(false),
          },
        ],
      },
      // stats: "none",
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
            terserOptions: {
              compress: {
                passes: 2,
              },
            },
          }),
        ],
      },

      plugins: [
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash].css",
        }),
      ],
    })
  );
}
