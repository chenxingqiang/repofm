import { z } from 'zod';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  handleError,
  repofmConfigValidationError,
  repofmError,
  rethrowValidationErrorIfZodError,
} from '../../src/shared/errorHandle.js';

vi.mock('../../src/shared/logger.js', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

describe('errorHandle', () => {
  let mockLogger: { error: ReturnType<typeof vi.fn>; debug: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const mod = await import('../../src/shared/logger.js');
    mockLogger = mod.logger as any;
    vi.clearAllMocks();
  });

  describe('repofmError', () => {
    it('should create error with correct name', () => {
      const error = new repofmError('test message');
      expect(error.name).toBe('repofmError');
      expect(error.message).toBe('test message');
    });

    it('should be an instance of Error', () => {
      const error = new repofmError('test');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new repofmError('test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('repofmConfigValidationError', () => {
    it('should create validation error with correct name', () => {
      const error = new repofmConfigValidationError('validation failed');
      expect(error.name).toBe('repofmConfigValidationError');
      expect(error.message).toBe('validation failed');
    });

    it('should be an instance of repofmError', () => {
      const error = new repofmConfigValidationError('test');
      expect(error).toBeInstanceOf(repofmError);
    });

    it('should be an instance of Error', () => {
      const error = new repofmConfigValidationError('test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('rethrowValidationErrorIfZodError', () => {
    it('should throw repofmConfigValidationError for ZodError', () => {
      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: 'string',
          received: 'number',
          path: ['field'],
          message: 'Expected string, received number',
        },
      ]);
      expect(() => rethrowValidationErrorIfZodError(zodError, 'Config error')).toThrow(
        repofmConfigValidationError
      );
    });

    it('should include the context in the thrown error message', () => {
      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: 'string',
          received: 'number',
          path: ['myField'],
          message: 'bad type',
        },
      ]);
      expect(() => rethrowValidationErrorIfZodError(zodError, 'My context')).toThrow('My context');
    });

    it('should include field path in thrown error message', () => {
      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: 'string',
          received: 'number',
          path: ['output', 'style'],
          message: 'bad value',
        },
      ]);
      try {
        rethrowValidationErrorIfZodError(zodError, 'ctx');
      } catch (err) {
        expect((err as Error).message).toContain('output.style');
      }
    });

    it('should not throw for non-Zod errors', () => {
      const error = new Error('normal error');
      expect(() => rethrowValidationErrorIfZodError(error, 'ctx')).not.toThrow();
    });

    it('should throw generic error for non-Error, non-Zod values', () => {
      expect(() => rethrowValidationErrorIfZodError('string error', 'ctx')).toThrow(
        'Unknown error occurred during validation'
      );
    });
  });

  describe('handleError', () => {
    it('should log repofmError correctly', async () => {
      const error = new repofmError('repofm specific error');
      handleError(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error: repofm specific error');
    });

    it('should log generic Error correctly', async () => {
      const error = new Error('generic error');
      handleError(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Unexpected error: generic error');
    });

    it('should log debug stack trace for Error', async () => {
      const error = new Error('error with stack');
      handleError(error);
      expect(mockLogger.debug).toHaveBeenCalledWith('Stack trace:', error.stack);
    });

    it('should handle null error', async () => {
      handleError(null);
      expect(mockLogger.error).toHaveBeenCalledWith('An unknown error occurred');
    });

    it('should handle undefined error', async () => {
      handleError(undefined);
      expect(mockLogger.error).toHaveBeenCalledWith('An unknown error occurred');
    });

    it('should handle string error', async () => {
      handleError('some string error');
      expect(mockLogger.error).toHaveBeenCalledWith('An unknown error occurred');
    });
  });
});
