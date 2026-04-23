import { describe, expect, it } from 'vitest';
import { PACKAGE_VERSION } from '../src/version.js';

describe('version', () => {
  it('should export a PACKAGE_VERSION string', () => {
    expect(typeof PACKAGE_VERSION).toBe('string');
  });

  it('should not be empty', () => {
    expect(PACKAGE_VERSION.length).toBeGreaterThan(0);
  });

  it('should follow semver format (X.Y.Z)', () => {
    expect(PACKAGE_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
