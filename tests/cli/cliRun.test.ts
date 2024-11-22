// tests/cli/cliRun.test.ts

import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import clipboardy from 'clipboardy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runDefaultAction } from '../../src/cli/actions/defaultAction.js';
import { runInitAction } from '../../src/cli/actions/initAction.js';
import { run } from '../../src/cli/cliRun.js';

// Mock setup
vi.mock('../../src/cli/actions/defaultAction');
vi.mock('../../src/cli/actions/initAction');
vi.mock('clipboardy');

describe('CLI', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.argv = ['node', 'repofm']; // Reset argv
  });

  describe('Global Options', () => {
    it('should handle global init', async () => {
      process.argv.push('--init', '--global');
      await run();

      expect(runInitAction).toHaveBeenCalledWith(
        expect.any(String),
        true
      );
    });
  });

  describe('Clipboard Integration', () => {
    it('should copy output to clipboard when requested', async () => {
      process.argv.push('--copy');
      await run();

      expect(runDefaultAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ copyToClipboard: true })
      );
    });
  });

  describe('Directory Handling', () => {
    it('should handle custom directory argument', async () => {
      process.argv.push('custom/directory');
      await run();

      expect(runDefaultAction).toHaveBeenCalledWith(
        'custom/directory',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should use current directory by default', async () => {
      await run();

      expect(runDefaultAction).toHaveBeenCalledWith(
        '.',
        expect.any(String),
        expect.any(Object)
      );
    });
  });
});
