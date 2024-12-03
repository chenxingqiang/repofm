#!/usr/bin/env node

const { fileURLToPath } = require('url');
const { dirname, join } = require('path');
const { default: cli } = require('../lib/cli.js');

async function main() {
  try {
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
