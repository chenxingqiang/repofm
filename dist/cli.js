#!/usr/bin/env node
import { run } from './cli/cliRun.js';
import process from 'node:process';
const pkg = { version: '2.1.1' };
export { run };
// Handle errors
run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // empty block
}
//# sourceMappingURL=cli.js.map