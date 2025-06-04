import { existsSync, mkdirSync } from "node:fs";
import { $ } from "bun";

async function build() {
  console.log("Building fcrawl executable...");

  try {
    // Ensure bin directory exists
    if (!existsSync("./bin")) {
      mkdirSync("./bin", { recursive: true });
    }

    // Build the executable to bin directory
    await $`bun build ./index.ts --compile --outfile ./bin/fcrawl`;

    console.log("Build successful! Executable created: ./bin/fcrawl");

    // Make it executable (should already be, but just in case)
    await $`chmod +x ./bin/fcrawl`;

    // Show file info
    const stats = await $`ls -lh ./bin/fcrawl`.text();
    console.log("\nExecutable info:");
    console.log(stats);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
