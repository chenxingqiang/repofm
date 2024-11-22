#!/usr/bin/env node
import { run } from './cli/cliRun.js';
run().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map