// tests/shared/errorHandle.test.ts

import { z } from 'zod';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleError, repofmConfigValidationError, repofmError, rethrowValidationErrorIfZodError } from '../../src/shared/errorHandle.js';
import { logger } from '../../src/shared/logger.js';

vi.mock('../../src/shared/logger');

describe('errorHandle', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('handleError', () => {
        it('should handle repofmError correctly', () => {
            const error = new repofmError('Custom repofm error');
            handleError(error);
            expect(logger.error).toHaveBeenCalledWith('Error: Custom repofm error');
        });

        it('should handle general Error', () => {
            const error = new Error('General error');
            handleError(error);
            expect(logger.error).toHaveBeenCalledWith('Unexpected error: General error');
            expect(logger.debug).toHaveBeenCalledWith('Stack trace:', error.stack);
        });

        it('should handle unknown error types', () => {
            const error = 'String error';
            handleError(error);
            expect(logger.error).toHaveBeenCalledWith('An unknown error occurred');
        });

        it('should handle error with no message', () => {
            const error = new Error();
            handleError(error);
            expect(logger.error).toHaveBeenCalledWith('Unexpected error: ');
        });

        it('should handle undefined error', () => {
            handleError(undefined);
            expect(logger.error).toHaveBeenCalledWith('An unknown error occurred');
        });

        it('should handle null error', () => {
            handleError(null);
            expect(logger.error).toHaveBeenCalledWith('An unknown error occurred');
        });

        it('should handle error with custom properties', () => {
            const error = new Error('Custom error');
            (error as any).code = 'CUSTOM_CODE';
            (error as any).details = { foo: 'bar' };

            handleError(error);
            expect(logger.error).toHaveBeenCalledWith('Unexpected error: Custom error');
            expect(logger.debug).toHaveBeenCalledWith('Stack trace:', expect.any(String));
        });

        it('should handle errors with debug logging', () => {
            const error = new Error('Custom error');
            const mockStack = 'Error: Custom error\n    at Test.fn';
            Object.defineProperty(error, 'stack', { value: mockStack });

            handleError(error);

            expect(logger.error).toHaveBeenCalledWith('Unexpected error: Custom error');
            expect(logger.debug).toHaveBeenCalledWith('Stack trace:', mockStack);
        });
    });

    describe('rethrowValidationErrorIfZodError', () => {
        it('should rethrow Zod error with custom message', () => {
            const zodError = new z.ZodError([
                {
                    code: z.ZodIssueCode.invalid_type,
                    expected: 'string',
                    received: 'number',
                    path: ['field'],
                    message: 'Expected string, received number'
                }
            ]);

            expect(() =>
                rethrowValidationErrorIfZodError(zodError, 'Configuration error')
            ).toThrow(repofmConfigValidationError);
        });

        it('should format multiple Zod errors correctly', () => {
            const zodError = new z.ZodError([
                {
                    code: z.ZodIssueCode.invalid_type,
                    expected: 'string',
                    received: 'number',
                    path: ['field1'],
                    message: 'Error 1'
                },
                {
                    code: z.ZodIssueCode.invalid_type,
                    expected: 'boolean',
                    received: 'string',
                    path: ['field2'],
                    message: 'Error 2'
                }
            ]);

            try {
                rethrowValidationErrorIfZodError(zodError, 'Multiple errors');
            } catch (error) {
                if (error instanceof repofmConfigValidationError) {
                    expect(error).toBeInstanceOf(repofmConfigValidationError);
                    expect(error.message).toContain('Error 1');
                    expect(error.message).toContain('Error 2');
                }
            }
        });

        it('should handle nested path in Zod errors', () => {
            const zodError = new z.ZodError([
                {
                    code: z.ZodIssueCode.invalid_type,
                    expected: 'string',
                    received: 'number',
                    path: ['parent', 'child', 'field'],
                    message: 'Invalid field'
                }
            ]);

            try {
                rethrowValidationErrorIfZodError(zodError, 'Nested error');
            } catch (error) {
                if (error instanceof repofmConfigValidationError) {
                    expect(error.message).toContain('parent.child.field');
                }
            }
        });

        it('should not rethrow non-Zod errors', () => {
            const error = new Error('Regular error');
            rethrowValidationErrorIfZodError(error, 'Test message');
            expect(logger.error).not.toHaveBeenCalled();
        });
    });

    describe('repofmError', () => {
        it('should create custom error with correct name', () => {
            const error = new repofmError('Custom message');
            expect(error.name).toBe('repofmError');
            expect(error.message).toBe('Custom message');
        });

        it('should support error inheritance', () => {
            const error = new repofmError('Test');
            expect(error).toBeInstanceOf(Error);
        });

        it('should maintain stack trace', () => {
            const error = new repofmError('Test');
            expect(error.stack).toBeDefined();
        });
    });

    describe('repofmConfigValidationError', () => {
        it('should create validation error with correct name', () => {
            const error = new repofmConfigValidationError('Validation failed');
            expect(error.name).toBe('repofmConfigValidationError');
            expect(error.message).toBe('Validation failed');
        });

        it('should inherit from repofmError', () => {
            const error = new repofmConfigValidationError('Test');
            expect(error).toBeInstanceOf(repofmError);
        });
    });

    describe('Error Integration', () => {
        it('should handle configuration validation errors properly', () => {
            const schema = z.object({
                field: z.string(),
            });

            try {
                schema.parse({ field: 123 });
                // This line should never be reached due to the validation error
                expect(true).toBe(false);
            } catch (error) {
                try {
                    rethrowValidationErrorIfZodError(error, 'Config validation');
                    // This line should never be reached due to the rethrow
                    expect(true).toBe(false);
                } catch (validationError) {
                    expect(validationError).toBeInstanceOf(repofmConfigValidationError);
                    expect(validationError.message).toContain('Config validation');
                    expect(validationError.message).toContain('[field]');
                    expect(validationError.message).toContain('Expected string, received number');
                }
            }

            expect(logger.error).not.toHaveBeenCalled();
        });

        it('should provide helpful error messages', () => {
            const schema = z.object({
                output: z.object({
                    style: z.enum(['plain', 'xml', 'markdown']),
                }),
            });

            try {
                schema.parse({ output: { style: 'invalid' } });
            } catch (error) {
                try {
                    rethrowValidationErrorIfZodError(error, 'Style validation');
                } catch (validationError) {
                    if (validationError instanceof repofmConfigValidationError) {
                        expect(validationError.message).toContain('Style validation');
                        expect(validationError.message).toContain('output.style');
                    }
                }
            }
        });

        it('should handle errors in async context', async () => {
            const asyncOperation = async () => {
                throw new repofmError('Async error');
            };

            try {
                await asyncOperation();
            } catch (error) {
                handleError(error);
            }

            expect(logger.error).toHaveBeenCalledWith('Error: Async error');
        });

        it('should handle errors with circular references', () => {
            const circularObj: any = { foo: 'bar' };
            circularObj.self = circularObj;
            const error = new Error('Circular error');
            (error as any).custom = circularObj;

            handleError(error);
            expect(logger.error).toHaveBeenCalledWith('Unexpected error: Circular error');
        });
    });

    describe('Error Context', () => {
        it('should include application version in error context', () => {
            const appVersion = '1.0.0';
            process.env.npm_package_version = appVersion;
            handleError(new Error('Test error'));
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining('https://github.com/chenxingqiang/repofm/issues')
            );
        });

        it('should handle missing application version', () => {
            delete process.env.npm_package_version;
            handleError(new Error('Test error'));
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('Error Recovery', () => {
        it('should suggest recovery actions for common errors', () => {
            const errorCases = [
                {
                    error: new Error('ENOENT: no such file or directory'),
                    contains: 'file or directory'
                },
                {
                    error: new Error('EACCES: permission denied'),
                    contains: 'permission denied'
                },
                {
                    error: new Error('ETIMEDOUT: operation timed out'),
                    contains: 'timed out'
                }
            ];

            errorCases.forEach(({ error, contains }) => {
                handleError(error);
                expect(logger.error).toHaveBeenCalledWith(
                    expect.stringContaining(contains)
                );
            });
        });

        it('should handle chain of errors', () => {
            const originalError = new Error('Original error');
            const wrappedError = new repofmError(`Wrapped: ${originalError.message}`);

            handleError(wrappedError);
            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining('Original error')
            );
        });
    });
});
