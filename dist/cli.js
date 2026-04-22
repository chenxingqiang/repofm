#!/usr/bin/env node
import { run } from './cli/cliRun.js';
import process from 'node:process';
export { run };
run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map