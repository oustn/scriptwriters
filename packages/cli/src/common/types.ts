import type Webpack from "webpack";
import type WebpackDevServer from "webpack-dev-server";

export type WebpackConfig = Webpack.Configuration & {
  devServer?: WebpackDevServer.Configuration;
};

export type NodeEnv = "production" | "development" | "test";

export interface Entry {
  id: string;
  import: string;
  filename: string;
}
