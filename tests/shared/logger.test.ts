import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock picocolors module
vi.mock('picocolors', async () => {
  return {
    default: {
      red: (str: string) => `RED:${str}`,
      yellow: (str: string) => `YELLOW:${str}`,
      green: (str: string) => `GREEN:${str}`,
      cyan: (str: string) => `CYAN:${str}`,
      dim: (str: string) => `DIM:${str}`,
      blue: (str: string) => `BLUE:${str}`,
      gray: (str: string) => `GRAY:${str}`
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

  it('should log messages correctly', () => {
    logger.log('test message');
    expect(consoleLogSpy).toHaveBeenCalledWith('test message');
  });

  it('should log numbers as strings', () => {
    logger.log(123);
    expect(consoleLogSpy).toHaveBeenCalledWith('123');
  });

  it('should handle error messages', () => {
    logger.error('error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('RED:error message');
  });

  it('should handle Error objects', () => {
    const error = new Error('test error');
    logger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('RED:test error');
  });

  it('should log success messages', () => {
    logger.success('success message');
    expect(consoleLogSpy).toHaveBeenCalledWith('GREEN:success message');
  });

  it('should log warning messages', () => {
    logger.warn('warning message');
    expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW:warning message');
  });

  it('should log info messages', () => {
    logger.info('info message');
    expect(consoleLogSpy).toHaveBeenCalledWith('CYAN:info message');
  });

  it('should log note messages', () => {
    logger.note('note message');
    expect(consoleLogSpy).toHaveBeenCalledWith('GRAY:note message');
  });

  it('should not log debug messages when verbose is false', () => {
    logger.setVerbose(false);
    logger.debug('debug message');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log debug messages when verbose is true', () => {
    logger.setVerbose(true);
    logger.debug('debug message');
    expect(consoleLogSpy).toHaveBeenCalledWith('BLUE:debug message');
  });

  it('should format object arguments correctly', () => {
    const obj = { key: 'value' };
    logger.info('Object:', obj);
    expect(consoleLogSpy).toHaveBeenCalledWith('CYAN:Object: {"key":"value"}');
  });

  it('should handle multiple arguments', () => {
    logger.info('Multiple', 'arguments', 123);
    expect(consoleLogSpy).toHaveBeenCalledWith('CYAN:Multiple arguments 123');
  });
});
