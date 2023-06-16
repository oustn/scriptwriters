#!/usr/bin/env node
import { Command } from "commander";

import { cliVersion } from "./index.js";

const program = new Command();

program.version(`@scriptwriter/cli ${cliVersion}`);

program
  .command("dev")
  .description("Run dev server")
  .action(async () => {
    const { dev } = await import("./commands/dev.js");
    return dev();
  });

program
  .command("build")
  .description("Compile components in production mode")
  .action(async () => {
    const { build } = await import("./commands/build.js");
    return build();
  });

program.parse();
