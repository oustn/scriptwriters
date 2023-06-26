import process from "node:process";
import _ from "lodash";
import type { Configuration } from "webpack";
import { mergeWithCustomize } from "webpack-merge";

import { getScriptwriterConfig } from "./constant.js";
import { NodeEnv } from "./types";

export function setNodeEnv(value: NodeEnv) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.NODE_ENV = value;
}

export function getWebpackConfig(defaultConfig: Configuration) {
  const scriptwriterConfig = getScriptwriterConfig();
  const webpackConfigure = scriptwriterConfig.webpackConfig;

  if (webpackConfigure) {
    const customMerge = mergeWithCustomize({
      customizeArray(arr1, arr2) {
        return _.uniqWith([...arr1, ...arr2], _.isEqual);
      },
    });

    if (typeof webpackConfigure === "function") {
      return customMerge(defaultConfig, webpackConfigure(defaultConfig));
    }

    return customMerge(defaultConfig, webpackConfigure);
  }
  return defaultConfig;
}

export function urlJoin(host: string, url: string) {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `${host!.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}
