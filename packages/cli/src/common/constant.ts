import { join, isAbsolute } from "node:path";
import process from "node:process";

import appRoot from "app-root-path";
import { pathToFileURL } from "url";

export const CWD = process.cwd();
export const ROOT = appRoot.path;

export const resolve = appRoot.resolve;

export const CONFIG_FILE = join(ROOT, "scriptwriter.config.mjs");
export const PACKAGE_JSON_FILE = join(ROOT, "package.json");

export const DEFAULT_DIST = join(ROOT, "dist");

export const GREEN = "#07c160";

async function getScriptwriterConfigAsync() {
  try {
    return (await import(pathToFileURL(CONFIG_FILE).href)).default;
  } catch (err) {
    return {};
  }
}

const scriptwriterConfig = await getScriptwriterConfigAsync();

export function getScriptwriterConfig() {
  return scriptwriterConfig;
}

export function getDist() {
  const { dist } = getScriptwriterConfig();
  if (!dist) return DEFAULT_DIST;
  if (isAbsolute(dist)) return dist;
  return resolve(dist);
}
