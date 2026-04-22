import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { parsePackageJsonContent } from '../../../src/core/file/packageJsonParse.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

describe('parsePackageJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should parse valid JSON', () => {
    const validJson = '{"name": "test", "version": "1.0.0"}';
    const result = parsePackageJsonContent(validJson);
    expect(result).toEqual({ name: 'test', version: '1.0.0' });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
