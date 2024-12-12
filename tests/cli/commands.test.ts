import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { run } from '../../src/cli/cliRun';
import * as fs from 'fs/promises';
import { logger } from '../../src/shared/logger';
import type { Command as CommandType } from 'commander';
import { searchFiles } from '../../src/core/fileSearch';
import { runDefaultAction } from '../../src/cli/actions/defaultAction';
import { runInitAction } from '../../src/cli/actions/initAction';

// Create a more comprehensive mock type that extends the base Command type
type MockCommandType = CommandType & {
  opts: () => { verbose?: boolean } & Record<string, any>;
  _opts?: Record<string, any>;
};

// Comprehensive mocking
vi.mock('../../src/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    setLevel: vi.fn(),
    warn: vi.fn(),
    trace: vi.fn(),
    log: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn((filePath) => {
    if (filePath.includes('package.json')) {
      return Promise.resolve('{"name": "repofm", "version": "1.0.0"}');
    }
    return Promise.resolve('');
  }),
  writeFile: vi.fn(),
  appendFile: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
  stat: vi.fn()
}));

vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    dirname: vi.fn((p) => '/mocked/dir'),
    join: vi.fn(() => '/mocked/package.json'),
    resolve: vi.fn()
  };
});

vi.mock('commander', () => {
  const mockCommand: MockCommandType = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    argument: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn().mockReturnThis(),
    parseAsync: vi.fn().mockResolvedValue(undefined),
    opts: vi.fn(() => ({ verbose: true })),
    _opts: {}
  };
  
  const mockCommandConstructor = vi.fn(() => mockCommand);
  
  return {
    Command: mockCommandConstructor
  };
});

describe('CLI Commands', () => {
  let originalArgv: string[];
  let commandMock: MockCommandType;
  let mockProcessExit: ((code?: number | string | null) => never) & { 
    mockImplementation: (fn: (code?: number | string | null) => never) => void 
  };
  let mockConsole = {
    log: vi.fn(),
    error: vi.fn()
  };

  const originalProcessExit = process.exit;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Preserve original argv
    originalArgv = process.argv;

    // Mock console methods
    mockConsole.log.mockImplementation(() => {});
    mockConsole.error.mockImplementation(() => {});

    // Mock process.exit
    mockProcessExit = vi.fn((code?: number | string | null) => {
      throw new Error(`Process exited with code ${code}`);
    }) as ((code?: number | string | null) => never) & { 
      mockImplementation: (fn: (code?: number | string | null) => never) => void 
    };
    process.exit = mockProcessExit;

    // Mock Command constructor
    commandMock = vi.mocked(vi.fn<MockCommandType>())();
  });

  afterEach(() => {
    // Restore original argv and process.exit
    process.argv = originalArgv;
    process.exit = originalProcessExit;
    vi.restoreAllMocks();
  });

  it('should run CLI without errors', async () => {
    // Set up test argv
    process.argv = ['node', 'cli.js', 'some-command'];

    // Run the CLI
    await run();

    // Verify expected interactions
    expect(commandMock.name).toHaveBeenCalledWith('repofm');
    expect(commandMock.description).toHaveBeenCalled();
    expect(commandMock.version).toHaveBeenCalled();
  });

  describe('list command', () => {
    it('should list tracked files with default ignores', async () => {
      process.argv = ['node', 'cli.js', 'list'];
      vi.mocked(searchFiles).mockResolvedValue(['file1.txt', 'file2.js']);
      await run();
      expect(searchFiles).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        ignore: {
          excludePatterns: expect.arrayContaining([
            'node_modules/**',
            '.git/**',
            'dist/**',
            'lib/**',
            'coverage/**',
            '**/*.d.ts',
            '**/*.map'
          ])
        }
      }));
      expect(mockConsole.log).toHaveBeenCalledWith('Tracked files:');
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('file1.txt'));
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('file2.js'));
    });

    it('should list all files when --all flag is used', async () => {
      process.argv = ['node', 'cli.js', 'list', '--all'];
      commandMock.opts = vi.fn(() => ({ all: true }));
      vi.mocked(searchFiles).mockResolvedValue(['file1.txt', 'node_modules/pkg/index.js']);
      await run();
      expect(searchFiles).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        ignore: {
          excludePatterns: []
        }
      }));
    });

    it('should handle no files found', async () => {
      process.argv = ['node', 'cli.js', 'list'];
      vi.mocked(searchFiles).mockResolvedValue([]);
      await run();
      expect(mockConsole.log).toHaveBeenCalledWith('No tracked files found');
    });
  });

  describe('status command', () => {
    it('should show current configuration', async () => {
      process.argv = ['node', 'cli.js', 'status'];
      await run();
      expect(mockConsole.log).toHaveBeenCalledWith('Current configuration:');
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('output'));
    });
  });

  describe('exclude command', () => {
    it('should add pattern to .repofmignore', async () => {
      process.argv = ['node', 'cli.js', 'exclude', '*.log'];
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(fs.appendFile).mockResolvedValue();
      await run();
      expect(fs.appendFile).toHaveBeenCalledWith(expect.stringContaining('.repofmignore'), '*.log');
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Added pattern'));
    });

    it('should not add duplicate pattern', async () => {
      process.argv = ['node', 'cli.js', 'exclude', '*.log'];
      vi.mocked(fs.readFile).mockResolvedValue('*.log\n*.tmp');
      await run();
      expect(fs.appendFile).not.toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    });

    it('should append pattern with newline if file not empty', async () => {
      process.argv = ['node', 'cli.js', 'exclude', '*.log'];
      vi.mocked(fs.readFile).mockResolvedValue('*.tmp');
      vi.mocked(fs.appendFile).mockResolvedValue();
      await run();
      expect(fs.appendFile).toHaveBeenCalledWith(expect.stringContaining('.repofmignore'), '\n*.log');
    });
  });

  describe('clean command', () => {
    it('should remove generated files', async () => {
      process.argv = ['node', 'cli.js', 'clean'];
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);
      await run();
      expect(fs.unlink).toHaveBeenCalledWith('output.txt');
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Removed generated file'));
    });

    it('should handle no files to clean', async () => {
      process.argv = ['node', 'cli.js', 'clean'];
      vi.mocked(fs.access).mockRejectedValue({ code: 'ENOENT' });
      await run();
      expect(mockConsole.log).toHaveBeenCalledWith('No generated files to clean');
    });
  });

  describe('default command', () => {
    it('should run init action with global flag', async () => {
      process.argv = ['node', 'cli.js', '--init', '--global'];
      commandMock.opts = vi.fn(() => ({ init: true, global: true }));
      await run();
      expect(runInitAction).toHaveBeenCalledWith(expect.any(String), true);
    });

    it('should run default action with options', async () => {
      process.argv = ['node', 'cli.js', '--copy', '--output', 'out.txt'];
      commandMock.opts = vi.fn(() => ({ copy: true, output: 'out.txt' }));
      await run();
      expect(runDefaultAction).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        copy: true,
        output: 'out.txt'
      }));
    });

    it('should enable verbose logging', async () => {
      process.argv = ['node', 'cli.js', '--verbose'];
      commandMock.opts = vi.fn(() => ({ verbose: true }));
      await run();
      expect(logger.setLevel).toHaveBeenCalledWith('debug');
    });

    it('should handle errors gracefully', async () => {
      process.argv = ['node', 'cli.js'];
      const error = new Error('Test error');
      vi.mocked(runDefaultAction).mockRejectedValue(error);
      await run();
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('CLI execution', () => {
    beforeEach(() => {
      // Set NODE_ENV to test to trigger error throwing instead of process.exit
      process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
      // Reset NODE_ENV
      delete process.env.NODE_ENV;
    });

    it('should handle CLI execution failure', async () => {
      // Create a custom mock for process.exit that captures the call
      const processExitMock = vi.fn();
      const originalProcessExit = process.exit;
      process.exit = processExitMock;

      try {
        // Mock the run function to simulate a failure
        const { run } = await import('../../src/cli/cliRun');
        
        // Simulate a failure scenario
        vi.spyOn(commandMock, 'parseAsync').mockRejectedValue(new Error('Test CLI failure'));

        // Attempt to run and catch the expected error
        await expect(run()).rejects.toThrow('Test CLI failure');

        // Verify that logger.error was called
        expect(logger.error).toHaveBeenCalledWith('Unhandled error:', expect.any(Error));
      } finally {
        // Restore the original process.exit
        process.exit = originalProcessExit;
      }
    });
  });
});
