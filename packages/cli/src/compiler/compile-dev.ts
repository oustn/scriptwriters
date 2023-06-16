import { getDevConfig } from "../config/webpack.dev.js";
export async function compileDev() {
  const config = getDevConfig();
  console.log("dev");
}
