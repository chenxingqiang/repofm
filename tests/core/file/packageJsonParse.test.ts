import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { parsePackageJson } from '../../../src/core/file/packageJsonParse.js';
import { logger } from '../../../src/utils/logger.js';

vi.mock('../../../src/utils/logger.js', () => ({
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
    const result = parsePackageJson(validJson);
    expect(result).toEqual({ name: 'test', version: '1.0.0' });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
