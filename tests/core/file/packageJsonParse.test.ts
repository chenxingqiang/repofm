import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { parsePackageJson } from '../../../src/core/file/packageJsonParse.js';
import { logger } from '../../../src/utils/logger.js';

jest.mock('../../../src/utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('parsePackageJson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should parse valid JSON', () => {
    const validJson = '{"name": "test", "version": "1.0.0"}';
    const result = parsePackageJson(validJson);
    expect(result).toEqual({ name: 'test', version: '1.0.0' });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
