import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';
import * as prompts from '@clack/prompts';

vi.mock('@clack/prompts', () => ({
  log: {
    message: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  }
}));

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log messages correctly', () => {
    logger.log('test message');
    expect(prompts.log.message).toHaveBeenCalledWith('test message');
  });

  it('should log numbers as strings', () => {
    logger.log(123);
    expect(prompts.log.message).toHaveBeenCalledWith('123');
  });

  it('should handle error messages', () => {
    logger.error('error message');
    expect(prompts.log.error).toHaveBeenCalledWith('error message');
  });

  it('should handle Error objects', () => {
    const error = new Error('test error');
    logger.error(error);
    expect(prompts.log.error).toHaveBeenCalledWith('test error');
  });

  it('should log success messages', () => {
    logger.success('success message');
    expect(prompts.log.success).toHaveBeenCalledWith('success message');
  });

  it('should log warning messages', () => {
    logger.warn('warning message');
    expect(prompts.log.warn).toHaveBeenCalledWith('warning message');
  });

  it('should log info messages', () => {
    logger.info('info message');
    expect(prompts.log.info).toHaveBeenCalledWith('info message');
  });
}); 