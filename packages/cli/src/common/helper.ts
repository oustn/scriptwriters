import process from "node:process";

export type NodeEnv = "production" | "development" | "test";

export function setNodeEnv(value: NodeEnv) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.NODE_ENV = value;
}
