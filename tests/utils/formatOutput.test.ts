import { describe, expect, it } from 'vitest';
import { formatFindResults } from '../../src/utils/formatOutput.js';

describe('formatOutput', () => {
  describe('formatFindResults', () => {
    const targetDir = '/project';

    it('should format results as plain text by default', () => {
      const results = ['src/index.ts', 'src/utils.ts'];
      const output = formatFindResults(results, { format: 'plain', targetDir });
      expect(output).toBe('src/index.ts\nsrc/utils.ts');
    });

    it('should return empty string for empty results in plain format', () => {
      const output = formatFindResults([], { format: 'plain', targetDir });
      expect(output).toBe('');
    });

    it('should format results as JSON', () => {
      const results = ['src/index.ts'];
      const output = formatFindResults(results, { format: 'json', targetDir });
      const parsed = JSON.parse(output);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].path).toBe('src/index.ts');
      expect(parsed[0].absolutePath).toContain('src/index.ts');
    });

    it('should include absolutePath in JSON format', () => {
      const results = ['src/app.ts'];
      const output = formatFindResults(results, { format: 'json', targetDir: '/my/project' });
      const parsed = JSON.parse(output);
      expect(parsed[0].absolutePath).toContain('/my/project');
      expect(parsed[0].absolutePath).toContain('src/app.ts');
    });

    it('should format multiple results as JSON array', () => {
      const results = ['a.ts', 'b.ts', 'c.ts'];
      const output = formatFindResults(results, { format: 'json', targetDir });
      const parsed = JSON.parse(output);
      expect(parsed).toHaveLength(3);
      expect(parsed.map((r: any) => r.path)).toEqual(['a.ts', 'b.ts', 'c.ts']);
    });

    it('should return empty JSON array for empty results', () => {
      const output = formatFindResults([], { format: 'json', targetDir });
      const parsed = JSON.parse(output);
      expect(parsed).toEqual([]);
    });

    it('should handle single file in plain format', () => {
      const output = formatFindResults(['README.md'], { format: 'plain', targetDir });
      expect(output).toBe('README.md');
    });

    it('should produce pretty-printed JSON', () => {
      const results = ['file.ts'];
      const output = formatFindResults(results, { format: 'json', targetDir });
      // Pretty-printed JSON has newlines
      expect(output).toContain('\n');
    });
  });
});
