#!/usr/bin/env node

const { fileURLToPath } = require('url');
const { dirname, join } = require('path');
const path = require('path');

async function main() {
  try {
    const cliPath = path.join(__dirname, '..', 'lib', 'cli.js');
    const { default: cli } = await import(cliPath);
    await cli();
  } catch (error) {
    console.error("Error running CLI:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
