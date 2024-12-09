import { jest, afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { formatGitUrl } from '../../../src/cli/actions/remoteAction.js';

jest.mock('node:fs/promises');
jest.mock('node:child_process');
jest.mock('../../../src/cli/actions/defaultAction.js');
jest.mock('../../../src/shared/logger.js');

describe('remoteAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatGitUrl', () => {
    test('should format GitHub shorthand correctly', () => {
      expect(formatGitUrl('user/repo')).toBe('https://github.com/user/repo.git');
      expect(formatGitUrl('user-name/repo-name')).toBe('https://github.com/user-name/repo-name.git');
      expect(formatGitUrl('user_name/repo_name')).toBe('https://github.com/user_name/repo_name.git');
    });

    test('should add .git to HTTPS URLs if missing', () => {
      expect(formatGitUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo.git');
    });

    test('should not modify URLs that are already correctly formatted', () => {
      expect(formatGitUrl('https://github.com/user/repo.git')).toBe('https://github.com/user/repo.git');
      expect(formatGitUrl('git@github.com:user/repo.git')).toBe('git@github.com:user/repo.git');
    });

    test('should not modify SSH URLs', () => {
      expect(formatGitUrl('git@github.com:user/repo.git')).toBe('git@github.com:user/repo.git');
    });

    test('should not modify URLs from other Git hosting services', () => {
      expect(formatGitUrl('https://gitlab.com/user/repo.git')).toBe('https://gitlab.com/user/repo.git');
      expect(formatGitUrl('https://bitbucket.org/user/repo.git')).toBe('https://bitbucket.org/user/repo.git');
    });
  });
});
