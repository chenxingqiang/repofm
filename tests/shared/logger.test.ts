import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock picocolors module
jest.mock('picocolors', async () => {
  return {
    red: (text: string) => `red(${text})`,
    yellow: (text: string) => `yellow(${text})`,
    blue: (text: string) => `blue(${text})`,
    green: (text: string) => `green(${text})`,
    cyan: (text: string) => `cyan(${text})`,
    dim: (text: string) => `dim(${text})`,
    gray: (text: string) => `gray(${text})`
  };
});

// Mock logger module
jest.mock('../../src/shared/logger', async () => {
  const actual = await jest.importActual('../../src/shared/logger');
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
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle error messages', () => {
    logger.error('error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('red(ERROR:) error message');
  });

  it('should handle Error objects', () => {
    const error = new Error('test error');
    logger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('red(ERROR:) {}');
  });

  it('should log success messages', () => {
    logger.success('success message');
    expect(consoleLogSpy).toHaveBeenCalledWith('green(SUCCESS:) success message');
  });

  it('should log warning messages', () => {
    logger.warn('warning message');
    expect(consoleLogSpy).toHaveBeenCalledWith('yellow(WARN:) warning message');
  });

  it('should log info messages', () => {
    logger.info('info message');
    expect(consoleLogSpy).toHaveBeenCalledWith('cyan(INFO:) info message');
  });

  it('should log debug messages', () => {
    logger.setLevel('debug');
    logger.debug('debug message');
    expect(consoleLogSpy).toHaveBeenCalledWith('dim(DEBUG:) debug message');
  });

  it('should not log debug messages when level is info', () => {
    logger.setLevel('info');
    logger.debug('debug message');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should format object arguments correctly', () => {
    const obj = { key: 'value' };
    logger.info('Object:', obj);
    expect(consoleLogSpy).toHaveBeenCalledWith('cyan(INFO:) Object: {"key":"value"}');
  });

  it('should handle multiple arguments', () => {
    logger.info('Multiple', 'arguments', 123);
    expect(consoleLogSpy).toHaveBeenCalledWith('cyan(INFO:) Multiple arguments 123');
  });

  it('should respect log levels', () => {
    logger.setLevel('warn');
    logger.info('info message');
    expect(consoleLogSpy).not.toHaveBeenCalled();
    logger.warn('warning message');
    expect(consoleLogSpy).toHaveBeenCalledWith('yellow(WARN:) warning message');
  });

  it('should handle trace messages', () => {
    const consoletraceSpy = jest.spyOn(console, 'trace').mockImplementation(() => {});
    logger.setLevel('debug');
    logger.trace('trace message');
    expect(consoletraceSpy).toHaveBeenCalledWith('dim(TRACE:) trace message');
  });
});
