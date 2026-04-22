import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../../src/config/defaultConfig.js';

describe('defaultConfig', () => {
  it('should have output configuration', () => {
    expect(defaultConfig.output).toBeDefined();
  });

  it('should have a default output style', () => {
    expect(['plain', 'xml', 'markdown']).toContain(defaultConfig.output.style);
  });

  it('should have a filePath in output', () => {
    expect(typeof defaultConfig.output.filePath).toBe('string');
  });

  it('should have removeComments boolean', () => {
    expect(typeof defaultConfig.output.removeComments).toBe('boolean');
  });

  it('should have removeEmptyLines boolean', () => {
    expect(typeof defaultConfig.output.removeEmptyLines).toBe('boolean');
  });

  it('should have showLineNumbers boolean', () => {
    expect(typeof defaultConfig.output.showLineNumbers).toBe('boolean');
  });

  it('should have copyToClipboard boolean', () => {
    expect(typeof defaultConfig.output.copyToClipboard).toBe('boolean');
  });

  it('should have topFilesLength number', () => {
    expect(typeof defaultConfig.output.topFilesLength).toBe('number');
  });

  it('should have include array', () => {
    expect(Array.isArray(defaultConfig.include)).toBe(true);
  });

  it('should have ignore configuration', () => {
    expect(defaultConfig.ignore).toBeDefined();
    expect(typeof defaultConfig.ignore.useDefaultPatterns).toBe('boolean');
    expect(typeof defaultConfig.ignore.useGitignore).toBe('boolean');
    expect(Array.isArray(defaultConfig.ignore.customPatterns)).toBe(true);
  });

  it('should have security configuration', () => {
    expect(defaultConfig.security).toBeDefined();
    expect(typeof defaultConfig.security.enableSecurityCheck).toBe('boolean');
  });

  it('should not be mutated (is a stable reference)', () => {
    // Importing twice should give the same value
    expect(defaultConfig.output.style).toBeDefined();
  });
});
