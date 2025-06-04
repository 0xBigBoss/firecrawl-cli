#!/usr/bin/env node
import { createCLI } from "./cli";

async function main() {
  const program = createCLI();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
