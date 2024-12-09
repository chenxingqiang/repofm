// tests/cli/cliRun.test.ts

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { run } from '../../src/cli/cliRun';
import { PACKAGE_VERSION } from '../../src/version';
import { logger } from '../../src/shared/logger';
import { Command } from 'commander';

// Mock logger
jest.mock('../../src/shared/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    setLevel: jest.fn()
  }
}));

// Mock Commander
jest.mock('commander', () => {
  return {
    Command: jest.fn()
  };
});

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

jest.mock('../../src/config/configLoad', () => ({
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
    jest.clearAllMocks();
    
    // Create command mock
    commandMock = {
      version: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      argument: jest.fn().mockReturnThis(),
      action: jest.fn().mockImplementation((handler) => {
        // Store the handler for later use
        commandMock._actionHandler = handler;
        return commandMock;
      }),
      parse: jest.fn().mockReturnThis(),
      parseAsync: jest.fn().mockImplementation(async () => {
        // Call the stored action handler with the mock options
        if (commandMock._actionHandler) {
          await commandMock._actionHandler(commandMock._opts || {});
        }
      }),
      opts: jest.fn().mockReturnValue({ verbose: false }),
      command: jest.fn()
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
    jest.mocked(Command).mockImplementation(() => commandMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should set up CLI with version and commands', async () => {
    process.argv = ['node', 'cli.js'];
    await run();
    expect(commandMock.version).toHaveBeenCalledWith(PACKAGE_VERSION);
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
