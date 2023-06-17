import webpack from "webpack";

import { getProdConfig } from "../config/webpack.prod.js";

export async function compile() {
  return new Promise((resolve, reject) => {
    const config = getProdConfig();

    webpack(config, (err, stats) => {
      if (err || stats?.hasErrors()) {
        reject();
      } else {
        resolve(null);
      }
    });
  });
}
