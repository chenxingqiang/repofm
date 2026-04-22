import { describe, expect, it } from 'vitest';
import { normalizePath, getRelativePath, joinPaths } from '../../../src/core/file/fileUtils.js';

describe('fileUtils', () => {
  describe('normalizePath', () => {
    it('should normalize a path with double slashes', () => {
      const result = normalizePath('src//utils//file.ts');
      expect(result).not.toContain('//');
    });

    it('should convert backslashes to forward slashes', () => {
      const result = normalizePath('src\\utils\\file.ts');
      expect(result).not.toContain('\\');
    });

    it('should handle already-normalized paths', () => {
      const result = normalizePath('src/utils/file.ts');
      expect(result).toContain('src');
      expect(result).toContain('utils');
      expect(result).toContain('file.ts');
    });

    it('should return a string', () => {
      expect(typeof normalizePath('some/path')).toBe('string');
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path from one dir to another', () => {
      const result = getRelativePath('/project/src', '/project/src/utils/file.ts');
      expect(result).toContain('utils');
      expect(result).toContain('file.ts');
    });

    it('should return empty string for identical paths', () => {
      const result = getRelativePath('/project/src', '/project/src');
      expect(result).toBe('');
    });

    it('should handle parent directory references', () => {
      const result = getRelativePath('/project/src/utils', '/project/src');
      expect(result).toContain('..');
    });
  });

  describe('joinPaths', () => {
    it('should join two path segments', () => {
      const result = joinPaths('/project', 'src');
      expect(result).toContain('project');
      expect(result).toContain('src');
    });

    it('should join multiple path segments', () => {
      const result = joinPaths('/project', 'src', 'utils', 'file.ts');
      expect(result).toContain('file.ts');
    });

    it('should return a string', () => {
      expect(typeof joinPaths('a', 'b')).toBe('string');
    });

    it('should handle empty segments gracefully', () => {
      const result = joinPaths('/project', '', 'file.ts');
      expect(result).toContain('file.ts');
    });
  });
});
