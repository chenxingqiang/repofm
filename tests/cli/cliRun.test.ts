// tests/cli/cliRun.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { run } from '../../src/cli/cliRun';
import { logger } from '../../src/shared/logger';
import { Command } from 'commander';

// Mock logger
vi.mock('../../src/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    setLevel: vi.fn()
  }
}));

// Mock Commander
vi.mock('commander', () => {
  return {
    Command: vi.fn()
  };
});

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

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

describe('CLI Run', () => {
  let commandMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create command mock
    commandMock = {
      version: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      argument: vi.fn().mockReturnThis(),
      action: vi.fn().mockImplementation((handler) => {
        // Store the handler for later use
        commandMock._actionHandler = handler;
        return commandMock;
      }),
      parse: vi.fn().mockReturnThis(),
      parseAsync: vi.fn().mockImplementation(async () => {
        // Call the stored action handler with the mock options
        if (commandMock._actionHandler) {
          await commandMock._actionHandler(commandMock._opts || {});
        }
      }),
      opts: vi.fn().mockReturnValue({ verbose: false }),
      command: vi.fn()
    };

    // Store reference to opts for parseAsync
    commandMock._opts = commandMock.opts();

    // Setup command creation
    commandMock.command.mockImplementation((name) => {
      const subCommand = { ...commandMock };
      subCommand.name = name;
      return subCommand;
    });

    // Setup Command constructor mock
    vi.mocked(Command).mockImplementation(() => commandMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should set up CLI with version and commands', async () => {
    process.argv = ['node', 'cli.js'];
    await run();
    expect(commandMock.version).toHaveBeenCalledWith('2.0.9');
    expect(commandMock.command).toHaveBeenCalled();
  });

  it('should handle verbose flag', async () => {
    process.argv = ['node', 'cli.js', '--verbose'];
    commandMock._opts = { verbose: true };
    await run();
    expect(logger.setLevel).toHaveBeenCalledWith('debug');
  });

  it('should handle errors gracefully', async () => {
    process.argv = ['node', 'cli.js'];
    const error = new Error('Test error');
    commandMock.parseAsync.mockRejectedValue(error);
    await run();
    expect(logger.error).toHaveBeenCalledWith('Error:', error);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
