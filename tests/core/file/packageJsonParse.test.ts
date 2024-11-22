import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parsePackageJson } from '../../../src/core/file/packageJsonParse.js';
import { logger } from '../../../src/utils/logger.js';

vi.mock('../../../src/utils/logger.js');

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('parsePackageJson', () => {
  let mockLogger: {
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    };
    (logger as unknown) = mockLogger;
  });

  it('should parse valid JSON', () => {
    const validJson = '{"name": "test", "version": "1.0.0"}';
    const result = parsePackageJson(validJson);
    expect(result).toEqual({ name: 'test', version: '1.0.0' });
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});
