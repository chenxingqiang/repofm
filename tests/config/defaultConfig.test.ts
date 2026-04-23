import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../../src/config/defaultConfig.js';

describe('defaultConfig', () => {
  it('should have an output section', () => {
    expect(defaultConfig.output).toBeDefined();
  });

  it('should have a default output style of markdown', () => {
    expect(defaultConfig.output.style).toBe('markdown');
  });

  it('should have removeComments set to false by default', () => {
    expect(defaultConfig.output.removeComments).toBe(false);
  });

  it('should have removeEmptyLines set to false by default', () => {
    expect(defaultConfig.output.removeEmptyLines).toBe(false);
  });

  it('should have showLineNumbers set to false by default', () => {
    expect(defaultConfig.output.showLineNumbers).toBe(false);
  });

  it('should have copyToClipboard set to false by default', () => {
    expect(defaultConfig.output.copyToClipboard).toBe(false);
  });

  it('should have topFilesLength of 10 by default', () => {
    expect(defaultConfig.output.topFilesLength).toBe(10);
  });

  it('should have a headerText', () => {
    expect(defaultConfig.output.headerText).toBe('Repository Content');
  });

  it('should have an instructionFilePath', () => {
    expect(defaultConfig.output.instructionFilePath).toBe('instructions.md');
  });

  it('should have include patterns array', () => {
    expect(Array.isArray(defaultConfig.include)).toBe(true);
    expect(defaultConfig.include).toContain('**/*');
  });

  it('should have an ignore section', () => {
    expect(defaultConfig.ignore).toBeDefined();
  });

  it('should use default patterns in ignore', () => {
    expect(defaultConfig.ignore.useDefaultPatterns).toBe(true);
  });

  it('should use gitignore in ignore', () => {
    expect(defaultConfig.ignore.useGitignore).toBe(true);
  });

  it('should have default exclude patterns in ignore', () => {
    expect(Array.isArray(defaultConfig.ignore.excludePatterns)).toBe(true);
    expect(defaultConfig.ignore.excludePatterns).toContain('node_modules/**');
    expect(defaultConfig.ignore.excludePatterns).toContain('.git/**');
  });

  it('should have a security section', () => {
    expect(defaultConfig.security).toBeDefined();
  });

  it('should have enableSecurityCheck set to false by default', () => {
    expect(defaultConfig.security.enableSecurityCheck).toBe(false);
  });
});
