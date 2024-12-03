import { describe, test, expect, vi, beforeEach } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultAction';
import { pack } from '../../../src/core/packager';

// Mock the packager module
vi.mock('../../../src/core/packager', () => ({
  pack: vi.fn().mockResolvedValue({ 
    totalFiles: 1,
    fileCharCounts: { 'test.txt': 100 },
    output: 'test output'
  })
}));

describe('defaultAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should run the default command successfully', async () => {
    const cliOptions = {
      cwd: '/test/dir',
      copy: false,
      output: 'output.txt',
      security: true
    };

    const result = await runDefaultAction(cliOptions);
    expect(result).toBe(true);
    expect(pack).toHaveBeenCalledWith('/test/dir', expect.any(Object));
  });
});
