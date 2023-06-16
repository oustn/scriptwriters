import fs from "node:fs";
import { URL, fileURLToPath } from "node:url";

const packagePath = fileURLToPath(new URL("../package.json", import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
export const cliVersion: string = packageJson.version;

// eslint-disable-next-line turbo/no-undeclared-env-vars
process.env.SCRIPTWRITER_CLI_VERSION = cliVersion;
