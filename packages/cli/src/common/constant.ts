import { join } from "node:path";
import process from "node:process";

import appRoot from "app-root-path";

export const CWD = process.cwd();
export const ROOT = appRoot.path;
export const CONFIG_FILE = join(ROOT, "scriptwriter.config.mjs");
export const PACKAGE_JSON_FILE = join(ROOT, "package.json");
