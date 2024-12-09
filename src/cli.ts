#!/usr/bin/env node

import { run } from './cli/cliRun.js';
import { argv, exit } from 'node:process.js';

export { run };

// Run the CLI
run().catch(err => {
  console.error('Error:', err);
  exit(1);
});

// 如果直接运行此文件
if (import.meta.url === `file://${argv[1]}`) {
  // empty block
}
