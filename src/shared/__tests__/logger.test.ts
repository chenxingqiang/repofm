import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger } from '../logger.js';

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

vi.mock('../logger', async () => {
  const actual = await vi.importActual('../logger');
  return actual;
});

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: any;

  beforeEach(() => {
    Logger.resetInstance();
    logger = Logger.getInstance();
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      trace: vi.spyOn(console, 'trace').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Logging Methods', () => {
    it('should handle error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('\u001b[31mERROR:\u001b[39m', 'error message');
    });

    it('should handle Error objects', () => {
      const error = new Error('test error');
      logger.error(error);
      expect(consoleSpy.error).toHaveBeenCalledWith('\u001b[31mERROR:\u001b[39m', '{}');
    });

    it('should log success messages', () => {
      logger.success('success message');
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[32mSUCCESS:\u001b[39m', 'success message');
    });

    it('should log warning messages', () => {
      logger.warn('warning message');
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[33mWARN:\u001b[39m', 'warning message');
    });

    it('should log info messages', () => {
      logger.info('info message');
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[36mINFO:\u001b[39m', 'info message');
    });
  });

  describe('Debug Mode', () => {
    it('should log debug messages when level is debug', () => {
      logger.setLevel('debug');
      logger.debug('debug message');
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[90mDEBUG:\u001b[39m', 'debug message');
    });

    it('should not log debug messages when level is info', () => {
      logger.setLevel('info');
      logger.debug('debug message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('Complex Arguments', () => {
    it('should format object arguments correctly', () => {
      const obj = { key: 'value' };
      logger.info('Object:', obj);
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[36mINFO:\u001b[39m', 'Object: {"key":"value"}');
    });

    it('should handle multiple arguments', () => {
      logger.info('Multiple', 'arguments', 123);
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[36mINFO:\u001b[39m', 'Multiple arguments 123');
    });
  });

  describe('Log Levels', () => {
    it('should respect log level hierarchy', () => {
      logger.setLevel('warn');
      logger.info('info message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      logger.warn('warning message');
      expect(consoleSpy.log).toHaveBeenCalledWith('\u001b[33mWARN:\u001b[39m', 'warning message');
    });
  });

  describe('Trace Messages', () => {
    it('should handle trace messages in debug mode', () => {
      logger.setLevel('debug');
      logger.trace('trace message');
      expect(consoleSpy.trace).toHaveBeenCalledWith('\u001b[90mTRACE:\u001b[39m', 'trace message');
    });

    it('should not trace when level is info', () => {
      logger.setLevel('info');
      logger.trace('trace message');
      expect(consoleSpy.trace).not.toHaveBeenCalled();
    });
  });
});