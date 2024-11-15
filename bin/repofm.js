#!/usr/bin/env node

/*
Add this file so we can use `node bin/repofm` or `node bin/repofm.js`
instead of `node bin/repofm.cjs`.

This file should only used for development.
*/

'use strict';

import { run } from '../lib/cli/cliRun.js';

run();
