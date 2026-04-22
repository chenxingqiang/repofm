import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRequired,
  validateEnum,
  validateTimeRange,
  validateGitUrl,
  validateFilePath,
  validateOutputFormat,
  validateContextType,
  validateContextDepth,
  throwIfError,
} from '../../src/cli/validation.js';

describe('validation', () => {
  describe('validateRequired', () => {
    it('should return null for a non-empty string value', () => {
      expect(validateRequired('hello', 'field')).toBeNull();
    });

    it('should return error for undefined value', () => {
      const error = validateRequired(undefined, 'myField');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('MISSING_REQUIRED_PARAM');
      expect(error!.message).toContain('myField');
    });

    it('should return error for null value', () => {
      const error = validateRequired(null, 'myField');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('MISSING_REQUIRED_PARAM');
    });

    it('should return error for empty string', () => {
      const error = validateRequired('', 'myField');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('MISSING_REQUIRED_PARAM');
    });

    it('should return null for zero (falsy but valid)', () => {
      expect(validateRequired(0, 'count')).toBeNull();
    });

    it('should return null for false (falsy but valid)', () => {
      expect(validateRequired(false, 'flag')).toBeNull();
    });

    it('should return null for object values', () => {
      expect(validateRequired({}, 'obj')).toBeNull();
    });
  });

  describe('validateEnum', () => {
    const allowed = ['a', 'b', 'c'];

    it('should return null for an allowed value', () => {
      expect(validateEnum('a', allowed, 'choice')).toBeNull();
    });

    it('should return error for a disallowed value', () => {
      const error = validateEnum('z', allowed, 'choice');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_ENUM_VALUE');
      expect(error!.message).toContain('choice');
      expect(error!.message).toContain('a, b, c');
    });

    it('should be case-sensitive', () => {
      const error = validateEnum('A', allowed, 'choice');
      expect(error).not.toBeNull();
    });

    it('should handle empty allowed values list', () => {
      const error = validateEnum('a', [], 'choice');
      expect(error).not.toBeNull();
    });
  });

  describe('validateTimeRange', () => {
    it('should return null for valid day format', () => {
      expect(validateTimeRange('7d')).toBeNull();
      expect(validateTimeRange('30d')).toBeNull();
      expect(validateTimeRange('1d')).toBeNull();
    });

    it('should return null for valid week format', () => {
      expect(validateTimeRange('2w')).toBeNull();
      expect(validateTimeRange('1w')).toBeNull();
    });

    it('should return error for format without unit', () => {
      const error = validateTimeRange('7');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_TIME_RANGE');
    });

    it('should return error for invalid unit', () => {
      expect(validateTimeRange('7m')).not.toBeNull();
      expect(validateTimeRange('7h')).not.toBeNull();
      expect(validateTimeRange('7y')).not.toBeNull();
    });

    it('should return error for empty string', () => {
      expect(validateTimeRange('')).not.toBeNull();
    });

    it('should return error for non-numeric prefix', () => {
      expect(validateTimeRange('xd')).not.toBeNull();
    });

    it('should return error for decimal values', () => {
      expect(validateTimeRange('1.5d')).not.toBeNull();
    });
  });

  describe('validateGitUrl', () => {
    it('should return null for valid HTTPS Git URL', () => {
      expect(validateGitUrl('https://github.com/owner/repo.git')).toBeNull();
    });

    it('should return null for valid SSH Git URL', () => {
      expect(validateGitUrl('git@github.com:owner/repo.git')).toBeNull();
    });

    it('should return null for valid owner/repo format', () => {
      expect(validateGitUrl('owner/repo')).toBeNull();
    });

    it('should return error for plain string', () => {
      const error = validateGitUrl('not-a-url');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_GIT_URL');
    });

    it('should return error for empty string', () => {
      expect(validateGitUrl('')).not.toBeNull();
    });

    it('should return error for HTTPS URL without .git suffix', () => {
      expect(validateGitUrl('https://github.com/owner/repo')).not.toBeNull();
    });

    it('should return error for URL with spaces', () => {
      expect(validateGitUrl('https://github.com/owner/re po.git')).not.toBeNull();
    });
  });

  describe('validateFilePath', () => {
    it('should return null for a normal path', () => {
      expect(validateFilePath('src/index.ts')).toBeNull();
    });

    it('should return error for path with parent directory reference', () => {
      const error = validateFilePath('../secret/file.ts');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_FILE_PATH');
      expect(error!.message).toContain('..');
    });

    it('should return error for path with embedded ..', () => {
      const error = validateFilePath('src/../../etc/passwd');
      expect(error).not.toBeNull();
    });

    it('should return null for path starting with dot (hidden file)', () => {
      expect(validateFilePath('.env')).toBeNull();
    });

    it('should return null for root-relative path', () => {
      expect(validateFilePath('/home/user/file.txt')).toBeNull();
    });
  });

  describe('validateOutputFormat', () => {
    it('should return null for "plain"', () => {
      expect(validateOutputFormat('plain')).toBeNull();
    });

    it('should return null for "markdown"', () => {
      expect(validateOutputFormat('markdown')).toBeNull();
    });

    it('should return null for "xml"', () => {
      expect(validateOutputFormat('xml')).toBeNull();
    });

    it('should return error for invalid format', () => {
      const error = validateOutputFormat('json');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_ENUM_VALUE');
    });

    it('should return error for empty string', () => {
      expect(validateOutputFormat('')).not.toBeNull();
    });
  });

  describe('validateContextType', () => {
    it('should return null for "function"', () => {
      expect(validateContextType('function')).toBeNull();
    });

    it('should return null for "file"', () => {
      expect(validateContextType('file')).toBeNull();
    });

    it('should return null for "character"', () => {
      expect(validateContextType('character')).toBeNull();
    });

    it('should return error for invalid type', () => {
      const error = validateContextType('class');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_ENUM_VALUE');
    });
  });

  describe('validateContextDepth', () => {
    it('should return null for valid positive integer string', () => {
      expect(validateContextDepth('1')).toBeNull();
      expect(validateContextDepth('5')).toBeNull();
      expect(validateContextDepth('100')).toBeNull();
    });

    it('should return error for zero', () => {
      const error = validateContextDepth('0');
      expect(error).not.toBeNull();
      expect(error!.code).toBe('INVALID_DEPTH');
    });

    it('should return error for negative number', () => {
      expect(validateContextDepth('-1')).not.toBeNull();
    });

    it('should return error for non-numeric string', () => {
      expect(validateContextDepth('abc')).not.toBeNull();
    });

    it('should return error for empty string', () => {
      expect(validateContextDepth('')).not.toBeNull();
    });

    it('should accept float strings by truncating to integer (parseInt behavior)', () => {
      // parseInt('1.5') === 1, which is >= 1 and valid
      expect(validateContextDepth('1.5')).toBeNull();
    });
  });

  describe('throwIfError', () => {
    it('should not throw when error is null', () => {
      expect(() => throwIfError(null)).not.toThrow();
    });

    it('should call process.exit when error is provided', () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number | string | null) => undefined as never);
      const error = { message: 'Something went wrong', code: 'ERR' };
      throwIfError(error);
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });
});
