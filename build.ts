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

    // Determine the actual executable name (Windows adds .exe automatically)
    const isWindows = process.platform === "win32";
    const executableName = isWindows ? "./bin/fcrawl.exe" : "./bin/fcrawl";

    console.log(`Build successful! Executable created: ${executableName}`);

    // Make it executable on Unix-like systems (not needed on Windows)
    if (!isWindows) {
      await $`chmod +x ./bin/fcrawl`;
    }

    // Show file info using cross-platform approach
    try {
      if (isWindows) {
        const stats = await $`dir /q bin\\fcrawl.exe`.text();
        console.log("\nExecutable info:");
        console.log(stats);
      } else {
        const stats = await $`ls -lh ./bin/fcrawl`.text();
        console.log("\nExecutable info:");
        console.log(stats);
      }
    } catch (_infoError) {
      // If file info fails, just confirm the file exists
      if (existsSync(executableName)) {
        console.log(`\nExecutable confirmed at: ${executableName}`);
      } else {
        console.warn(`\nWarning: Could not confirm executable at: ${executableName}`);
      }
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
