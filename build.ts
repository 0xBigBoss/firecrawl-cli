import { $ } from "bun";

async function build() {
  console.log("Building fcrawl executable...");

  try {
    // Build the executable
    await $`bun build ./index.ts --compile --outfile fcrawl`;

    console.log("Build successful! Executable created: fcrawl");

    // Make it executable (should already be, but just in case)
    await $`chmod +x fcrawl`;

    // Show file info
    const stats = await $`ls -lh fcrawl`.text();
    console.log("\nExecutable info:");
    console.log(stats);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
