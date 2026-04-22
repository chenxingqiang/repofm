import { describe, expect, it } from 'vitest';
import { PACKAGE_VERSION } from '../src/version.js';

describe('version', () => {
  describe('PACKAGE_VERSION', () => {
    it('should be a string', () => {
      expect(typeof PACKAGE_VERSION).toBe('string');
    });

    it('should not be empty', () => {
      expect(PACKAGE_VERSION.length).toBeGreaterThan(0);
    });

    it('should follow semver format (major.minor.patch)', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;
      expect(semverRegex.test(PACKAGE_VERSION)).toBe(true);
    });

    it('should have a valid major version', () => {
      const [major] = PACKAGE_VERSION.split('.');
      expect(Number(major)).toBeGreaterThanOrEqual(0);
    });
  });
});
