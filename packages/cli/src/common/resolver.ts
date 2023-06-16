import path from "node:path";
import fs from "node:fs";
import { resolve } from "./constant.js";

const entries = ["scripts", "tasks"];

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
  entries.forEach((entry) => {
    const entryPath = resolve(entry);
    if (fs.existsSync(entryPath)) return;
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
  return result;
}
