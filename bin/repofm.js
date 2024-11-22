#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

async function main() {
  try {
    const cli = await import(join(__dirname, "../lib/cli.js"));
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
