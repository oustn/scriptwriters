import path from "node:path";
import fs from "node:fs";
import { getScriptwriterConfig, resolve } from "./constant.js";

const defaultIncludes = ["scripts", "tasks"];

function getSourceRoot() {
  const { includes } = getScriptwriterConfig();
  if (Array.isArray(includes) && includes.length) {
    return includes;
  }
  return includes ? [includes] : defaultIncludes;
}

function getTypescriptFiles(dir: string) {
  const files: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      files.push(...getTypescriptFiles(file));
    } else if (file.endsWith(".ts")) {
      files.push(file);
    }
  });
  return files;
}

export function resolveEntries() {
  const result: Record<string, { import: string; filename: string }> = {};
  const sources = getSourceRoot();
  sources.forEach((entry) => {
    const entryPath = path.isAbsolute(entry) ? entry : resolve(entry);
    if (!fs.existsSync(entryPath)) return;
    const files = getTypescriptFiles(entryPath);
    files.forEach((file) => {
      const relative = path.relative(entryPath, file);
      const name = relative.replace(/\.ts$/, "").replace(/\//g, ".");
      result[name] = {
        import: file,
        filename: `${entry}/[name].js`,
      };
    });
  });
  if (Object.keys(result).length === 0) {
    throw new Error(
      "No entry found. Please check your scriptwriter.config.mjs"
    );
  }
  return result;
}
