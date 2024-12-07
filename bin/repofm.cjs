#!/usr/bin/env node

const { fileURLToPath } = require('url');
const { dirname, join } = require('path');
const path = require('path');

async function main() {
  try {
    const cliPath = path.join(__dirname, '..', 'dist', 'cli', 'cliRun.js');
    const module = await import(cliPath);
    const runFunction = module.run || module.default?.run || module.default;
    
    if (typeof runFunction !== 'function') {
      throw new Error('Unable to find run function in CLI module');
    }
    
    await runFunction();
  } catch (error) {
    console.error("Error running CLI:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
