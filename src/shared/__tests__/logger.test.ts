vi.mock('picocolors', () => {
  const pc: Record<string, (str: string) => string> = {
    red: vi.fn((str: string) => `RED:${str}`),
    yellow: vi.fn((str: string) => `YELLOW:${str}`),
    green: vi.fn((str: string) => `GREEN:${str}`),
    cyan: vi.fn((str: string) => `CYAN:${str}`),
    dim: vi.fn((str: string) => `DIM:${str}`),
    blue: vi.fn((str: string) => `BLUE:${str}`),
  };
  return { default: pc };
});

vi.mock('../logger', async () => {
  const actual = await vi.importActual('../logger');
  return actual;
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import Logger after mocks
import { Logger } from '../logger';

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    // Reset the Logger singleton instance
    Logger.resetInstance();
    logger = Logger.getInstance();
    // Reset mocks and spies
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should maintain a single instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Logging Methods', () => {
    it('should log messages correctly', () => {
      logger.log('test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('test message');
    });

    it('should log numbers as strings', () => {
      logger.log(123);
      expect(consoleSpy.log).toHaveBeenCalledWith('123');
    });

    it('should handle error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('RED:error message');
    });

    it('should handle Error objects', () => {
      const error = new Error('test error');
      logger.error(error);
      expect(consoleSpy.error).toHaveBeenCalledWith('RED:test error');
    });

    it('should log success messages', () => {
      logger.success('success message');
      expect(consoleSpy.log).toHaveBeenCalledWith('GREEN:success message');
    });

    it('should log warning messages', () => {
      logger.warn('warning message');
      expect(consoleSpy.log).toHaveBeenCalledWith('YELLOW:warning message');
    });

    it('should log info messages', () => {
      logger.info('info message');
      expect(consoleSpy.log).toHaveBeenCalledWith('CYAN:info message');
    });

    it('should log dim messages', () => {
      logger.dim('dim message');
      expect(consoleSpy.log).toHaveBeenCalledWith('DIM:dim message');
    });
  });

  describe('Debug Mode', () => {
    it('should log debug messages when verbose is true', () => {
      logger.setVerbose(true);
      logger.debug('debug message');
      expect(consoleSpy.log).toHaveBeenCalledWith('BLUE:debug message');
    });

    it('should not log debug messages when verbose is false', () => {
      logger.setVerbose(false);
      logger.debug('debug message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('Complex Arguments', () => {
    it('should format object arguments correctly', () => {
      const obj = { key: 'value' };
      logger.info('Object:', obj);
      expect(consoleSpy.log).toHaveBeenCalledWith('CYAN:Object: ' + JSON.stringify(obj));
    });

    it('should handle multiple arguments', () => {
      logger.info('Multiple', 'arguments', 123);
      expect(consoleSpy.log).toHaveBeenCalledWith('CYAN:Multiple arguments 123');
    });
  });
});