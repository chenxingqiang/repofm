#!/usr/bin/env node

const { fileURLToPath } = require("url");
const { dirname, join } = require("path");
const currentDir = dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    const cli = await import(join(currentDir, "../lib/cli.js"));
    await cli.default();
  } catch (error) {
    console.error("Error loading CLI:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
