import { describe, expect, it } from 'vitest';
import { formatFindResults } from '../../src/utils/formatOutput.js';
import type { FormatOptions } from '../../src/utils/formatOutput.js';

describe('formatOutput', () => {
  describe('formatFindResults', () => {
    const targetDir = '/home/user/project';

    describe('plain format', () => {
      it('should join results with newlines', () => {
        const results = ['src/foo.ts', 'src/bar.ts'];
        const options: FormatOptions = { format: 'plain', targetDir };
        expect(formatFindResults(results, options)).toBe('src/foo.ts\nsrc/bar.ts');
      });

      it('should return empty string for empty results', () => {
        const options: FormatOptions = { format: 'plain', targetDir };
        expect(formatFindResults([], options)).toBe('');
      });

      it('should return single file without trailing newline', () => {
        const results = ['src/index.ts'];
        const options: FormatOptions = { format: 'plain', targetDir };
        expect(formatFindResults(results, options)).toBe('src/index.ts');
      });
    });

    describe('json format', () => {
      it('should return valid JSON array', () => {
        const results = ['src/foo.ts'];
        const options: FormatOptions = { format: 'json', targetDir };
        const output = formatFindResults(results, options);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
      });

      it('should include path and absolutePath for each result', () => {
        const results = ['src/foo.ts'];
        const options: FormatOptions = { format: 'json', targetDir };
        const output = formatFindResults(results, options);
        const parsed = JSON.parse(output);
        expect(parsed[0]).toHaveProperty('path', 'src/foo.ts');
        expect(parsed[0]).toHaveProperty('absolutePath');
      });

      it('should compute absolutePath by joining targetDir and file path', () => {
        const results = ['src/foo.ts'];
        const options: FormatOptions = { format: 'json', targetDir: '/project' };
        const output = formatFindResults(results, options);
        const parsed = JSON.parse(output);
        expect(parsed[0].absolutePath).toContain('src');
        expect(parsed[0].absolutePath).toContain('foo.ts');
      });

      it('should handle multiple results in JSON format', () => {
        const results = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
        const options: FormatOptions = { format: 'json', targetDir };
        const output = formatFindResults(results, options);
        const parsed = JSON.parse(output);
        expect(parsed).toHaveLength(3);
        expect(parsed[0].path).toBe('src/a.ts');
        expect(parsed[1].path).toBe('src/b.ts');
        expect(parsed[2].path).toBe('src/c.ts');
      });

      it('should return empty JSON array for empty results', () => {
        const options: FormatOptions = { format: 'json', targetDir };
        const output = formatFindResults([], options);
        const parsed = JSON.parse(output);
        expect(parsed).toEqual([]);
      });

      it('should produce pretty-printed JSON with indentation', () => {
        const results = ['file.ts'];
        const options: FormatOptions = { format: 'json', targetDir };
        const output = formatFindResults(results, options);
        expect(output).toContain('\n');
        expect(output).toContain('  ');
      });
    });
  });
});
