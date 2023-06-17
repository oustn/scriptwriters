import { merge } from "webpack-merge";
import { WebpackConfig } from "../common/types";
import { getWebpackConfig } from "../common/helper.js";
import { getDevConfig } from "./webpack.dev.js";

export function getProdConfig(): WebpackConfig {
  return getWebpackConfig(
    merge(getDevConfig(), {
      mode: "production",
      stats: "none",
      optimization: {
        minimize: true,
      },
    })
  );
}
