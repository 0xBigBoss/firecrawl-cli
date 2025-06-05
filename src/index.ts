#!/usr/bin/env node
import { createCLI } from "./cli";

async function main() {
  try {
    const program = createCLI();
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
