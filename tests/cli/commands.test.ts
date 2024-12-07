import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { run } from '../../src/cli/cliRun';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../../src/shared/logger';
import { Command } from 'commander';
import { searchFiles } from '../../src/core/fileSearch';
import { runDefaultAction } from '../../src/cli/actions/defaultAction';
import { runInitAction } from '../../src/cli/actions/initAction';

// Mock modules
vi.mock('../../src/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    setLevel: vi.fn()
  }
}));

vi.mock('fs/promises');
vi.mock('../../src/core/fileSearch');
vi.mock('../../src/cli/actions/defaultAction');
vi.mock('../../src/cli/actions/initAction');

// Mock Commander
vi.mock('commander', () => {
  return {
    Command: vi.fn()
  };
});

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

// Mock console
const mockConsole = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {})
};

vi.mock('../../src/config/configLoad', () => ({
  createDefaultConfig: () => ({
    output: {
      filePath: 'output.txt'
    },
    ignore: {
      excludePatterns: []
    },
    include: ['**/*']
  })
}));

describe('CLI Commands', () => {
  let commandMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create command mock
    commandMock = {
      version: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      argument: vi.fn().mockReturnThis(),
      command: vi.fn().mockImplementation((name) => {
        const subCommand = {
          name,
          description: vi.fn().mockReturnThis(),
          option: vi.fn().mockReturnThis(),
          action: vi.fn().mockImplementation((handler) => {
            subCommand._actionHandler = handler;
            return subCommand;
          }),
          _opts: {}
        };
        if (!commandMock._subCommands) {
          commandMock._subCommands = {};
        }
        commandMock._subCommands[name.split(' ')[0]] = subCommand;
        return subCommand;
      }),
      action: vi.fn().mockImplementation((handler) => {
        commandMock._actionHandler = handler;
        return commandMock;
      }),
      parse: vi.fn().mockReturnThis(),
      parseAsync: vi.fn().mockImplementation(async () => {
        const args = process.argv.slice(2);
        const cmdName = args[0];
        const subCommand = commandMock._subCommands && commandMock._subCommands[cmdName];
        
        if (subCommand && subCommand._actionHandler) {
          if (cmdName === 'exclude' && args.length > 1) {
            await subCommand._actionHandler(args[1]);
          } else {
            const cmdOptions = { ...subCommand._opts };
            if (args.includes('--all')) {
              cmdOptions.all = true;
            }
            await subCommand._actionHandler(cmdOptions);
          }
        } else if (commandMock._actionHandler) {
          const options = { ...commandMock._opts };
          if (args.includes('--all')) {
            options.all = true;
          }
          await commandMock._actionHandler(options);
        }
      }),
      opts: vi.fn().mockImplementation(() => commandMock._opts || {}),
      _opts: {},
      _subCommands: {}
    };

    // Store reference to opts for parseAsync
    commandMock._opts = commandMock.opts();
    commandMock._subCommands = {};

    // Setup Command constructor mock
    vi.mocked(Command).mockImplementation(() => commandMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
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
      commandMock._opts = { all: true };
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
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Added pattern'));
    });

    it('should not add duplicate pattern', async () => {
      process.argv = ['node', 'cli.js', 'exclude', '*.log'];
      vi.mocked(fs.readFile).mockResolvedValue('*.log\n*.tmp');
      await run();
      expect(fs.appendFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already exists'));
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
      commandMock._opts = { init: true, global: true };
      await run();
      expect(runInitAction).toHaveBeenCalledWith(expect.any(String), true);
    });

    it('should run default action with options', async () => {
      process.argv = ['node', 'cli.js', '--copy', '--output', 'out.txt'];
      commandMock._opts = { copy: true, output: 'out.txt' };
      await run();
      expect(runDefaultAction).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        copy: true,
        output: 'out.txt'
      }));
    });

    it('should enable verbose logging', async () => {
      process.argv = ['node', 'cli.js', '--verbose'];
      commandMock._opts = { verbose: true };
      await run();
      expect(logger.setLevel).toHaveBeenCalledWith('debug');
    });

    it('should handle errors gracefully', async () => {
      process.argv = ['node', 'cli.js'];
      const error = new Error('Test error');
      vi.mocked(runDefaultAction).mockRejectedValue(error);
      await run();
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
