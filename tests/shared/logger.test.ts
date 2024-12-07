import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock picocolors module
vi.mock('picocolors', async () => {
  return {
    default: {
      red: (str: string) => `\u001b[31m${str}\u001b[39m`,
      yellow: (str: string) => `\u001b[33m${str}\u001b[39m`,
      green: (str: string) => `\u001b[32m${str}\u001b[39m`,
      cyan: (str: string) => `\u001b[36m${str}\u001b[39m`,
      dim: (str: string) => `\u001b[90m${str}\u001b[39m`,
      blue: (str: string) => `\u001b[34m${str}\u001b[39m`,
      gray: (str: string) => `\u001b[90m${str}\u001b[39m`
    }
  };
});

// Mock logger module
vi.mock('../../src/shared/logger', async () => {
  const actual = await vi.importActual('../../src/shared/logger');
  return actual;
});

// Import after mocks
import { Logger } from '../../src/shared/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    Logger.resetInstance();
    logger = Logger.getInstance();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle error messages', () => {
    logger.error('error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('\u001b[31mERROR:\u001b[39m', 'error message');
  });

  it('should handle Error objects', () => {
    const error = new Error('test error');
    logger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('\u001b[31mERROR:\u001b[39m', '{}');
  });

  it('should log success messages', () => {
    logger.success('success message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[32mSUCCESS:\u001b[39m', 'success message');
  });

  it('should log warning messages', () => {
    logger.warn('warning message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[33mWARN:\u001b[39m', 'warning message');
  });

  it('should log info messages', () => {
    logger.info('info message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[36mINFO:\u001b[39m', 'info message');
  });

  it('should log debug messages', () => {
    logger.setLevel('debug');
    logger.debug('debug message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[90mDEBUG:\u001b[39m', 'debug message');
  });

  it('should not log debug messages when level is info', () => {
    logger.setLevel('info');
    logger.debug('debug message');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should format object arguments correctly', () => {
    const obj = { key: 'value' };
    logger.info('Object:', obj);
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[36mINFO:\u001b[39m', 'Object: {"key":"value"}');
  });

  it('should handle multiple arguments', () => {
    logger.info('Multiple', 'arguments', 123);
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[36mINFO:\u001b[39m', 'Multiple arguments 123');
  });

  it('should respect log levels', () => {
    logger.setLevel('warn');
    logger.info('info message');
    expect(consoleLogSpy).not.toHaveBeenCalled();
    logger.warn('warning message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\u001b[33mWARN:\u001b[39m', 'warning message');
  });

  it('should handle trace messages', () => {
    const consoletraceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {});
    logger.setLevel('debug');
    logger.trace('trace message');
    expect(consoletraceSpy).toHaveBeenCalledWith('\u001b[90mTRACE:\u001b[39m', 'trace message');
  });
});
