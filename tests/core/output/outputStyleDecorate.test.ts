import { describe, expect, it } from 'vitest';
import {
  generateHeader,
  generateSummaryPurpose,
  generateSummaryFileFormat,
  generateSummaryUsageGuidelines,
  generateSummaryNotes,
  generateSummaryAdditionalInfo,
} from '../../../src/core/output/outputStyleDecorate.js';

// Minimal merged config shape needed for these functions
function makeConfig(overrides: Record<string, any> = {}): any {
  return {
    cwd: '/project',
    output: {
      filePath: 'output.txt',
      style: 'plain',
      removeComments: false,
      removeEmptyLines: false,
      topFilesLength: 5,
      showLineNumbers: false,
      copyToClipboard: false,
      headerText: '',
      instructionFilePath: '',
      ...overrides,
    },
    include: [],
    ignore: { useGitignore: true, useDefaultPatterns: true, customPatterns: [] },
    security: { enableSecurityCheck: false },
  };
}

describe('outputStyleDecorate', () => {
  describe('generateHeader', () => {
    it('should include the generation date', () => {
      const date = '2024-01-01';
      const result = generateHeader(date);
      expect(result).toContain(date);
    });

    it('should return a non-empty string', () => {
      const result = generateHeader('2024-01-01');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should mention repofm', () => {
      const result = generateHeader('2024-01-01');
      expect(result.toLowerCase()).toContain('repofm');
    });
  });

  describe('generateSummaryPurpose', () => {
    it('should return a non-empty string', () => {
      const result = generateSummaryPurpose();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should describe AI usage', () => {
      const result = generateSummaryPurpose();
      expect(result.toLowerCase()).toMatch(/ai|automated|analysis/);
    });
  });

  describe('generateSummaryFileFormat', () => {
    it('should return a non-empty string', () => {
      const result = generateSummaryFileFormat();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should describe the file structure', () => {
      const result = generateSummaryFileFormat();
      expect(result).toMatch(/\d+\./); // numbered list
    });
  });

  describe('generateSummaryUsageGuidelines', () => {
    it('should return a non-empty string', () => {
      const config = makeConfig();
      const result = generateSummaryUsageGuidelines(config, '');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include header text note when headerText is set', () => {
      const config = makeConfig({ headerText: 'My project header' });
      const result = generateSummaryUsageGuidelines(config, '');
      expect(result).toContain('Repository Description');
    });

    it('should not include header text note when headerText is empty', () => {
      const config = makeConfig({ headerText: '' });
      const result = generateSummaryUsageGuidelines(config, '');
      expect(result).not.toContain('Repository Description');
    });

    it('should include instruction note when repositoryInstruction is set', () => {
      const config = makeConfig();
      const result = generateSummaryUsageGuidelines(config, 'some instruction');
      expect(result).toContain('Repository Instruction');
    });

    it('should not include instruction note when repositoryInstruction is empty', () => {
      const config = makeConfig();
      const result = generateSummaryUsageGuidelines(config, '');
      expect(result).not.toContain('Repository Instruction');
    });
  });

  describe('generateSummaryNotes', () => {
    it('should return a non-empty string', () => {
      const config = makeConfig();
      const result = generateSummaryNotes(config);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should mention comments removal when removeComments is true', () => {
      const config = makeConfig({ removeComments: true });
      const result = generateSummaryNotes(config);
      expect(result).toContain('comments');
    });

    it('should not mention comments removal when removeComments is false', () => {
      const config = makeConfig({ removeComments: false });
      const result = generateSummaryNotes(config);
      expect(result).not.toContain('Code comments have been removed');
    });

    it('should mention line numbers when showLineNumbers is true', () => {
      const config = makeConfig({ showLineNumbers: true });
      const result = generateSummaryNotes(config);
      expect(result).toContain('Line numbers');
    });

    it('should not mention line numbers when showLineNumbers is false', () => {
      const config = makeConfig({ showLineNumbers: false });
      const result = generateSummaryNotes(config);
      expect(result).not.toContain('Line numbers have been added');
    });
  });

  describe('generateSummaryAdditionalInfo', () => {
    it('should return a non-empty string', () => {
      const result = generateSummaryAdditionalInfo();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain a URL to repofm', () => {
      const result = generateSummaryAdditionalInfo();
      expect(result).toContain('https://github.com/chenxingqiang/repofm');
    });
  });
});
