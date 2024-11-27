import { jest } from '@jest/globals';
import { autoCommit } from '../index.js';
import { GitService } from '../../../services/GitService.js';
import { CliSpinner } from '../../../cli/cliSpinner.js';

jest.mock('../../../services/GitService.js');
jest.mock('../../../cli/cliSpinner.js');

describe('autoCommit', () => {
  const mockGitService = {
    isGitRepository: jest.fn(),
    getStatus: jest.fn(),
    stageAll: jest.fn(),
    stageFiles: jest.fn(),
    getStagedFiles: jest.fn(),
    generateCommitMessage: jest.fn(),
    commit: jest.fn(),
    getCurrentBranch: jest.fn(),
    push: jest.fn(),
  };

  const mockSpinner = {
    start: jest.fn(),
    succeed: jest.fn(),
    fail: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (GitService as jest.Mock).mockImplementation(() => mockGitService);
    (CliSpinner as jest.Mock).mockImplementation(() => mockSpinner);
  });

  it('should throw error if not in git repository', async () => {
    mockGitService.isGitRepository.mockResolvedValue(false);

    await expect(autoCommit('.', { all: true })).rejects.toThrow('Not a git repository');
    expect(mockSpinner.fail).toHaveBeenCalled();
  });

  it('should handle no changes to commit', async () => {
    mockGitService.isGitRepository.mockResolvedValue(true);
    mockGitService.getStatus.mockResolvedValue([]);

    await autoCommit('.', { all: true });

    expect(mockSpinner.info).toHaveBeenCalledWith('No changes to commit');
    expect(mockGitService.stageAll).not.toHaveBeenCalled();
  });

  it('should stage all files when --all is specified', async () => {
    mockGitService.isGitRepository.mockResolvedValue(true);
    mockGitService.getStatus.mockResolvedValue([{ path: 'file.txt', status: 'M' }]);
    mockGitService.getStagedFiles.mockResolvedValue(['file.txt']);
    mockGitService.generateCommitMessage.mockResolvedValue('update: 1 file');

    await autoCommit('.', { all: true });

    expect(mockGitService.stageAll).toHaveBeenCalled();
    expect(mockGitService.commit).toHaveBeenCalledWith('update: 1 file');
  });

  it('should stage files matching pattern when --pattern is specified', async () => {
    mockGitService.isGitRepository.mockResolvedValue(true);
    mockGitService.getStatus.mockResolvedValue([{ path: 'src/file.ts', status: 'M' }]);
    mockGitService.getStagedFiles.mockResolvedValue(['src/file.ts']);
    mockGitService.generateCommitMessage.mockResolvedValue('update: 1 file');

    await autoCommit('.', { pattern: '*.ts' });

    expect(mockGitService.stageFiles).toHaveBeenCalledWith('*.ts');
    expect(mockGitService.commit).toHaveBeenCalledWith('update: 1 file');
  });

  it('should use custom commit message when provided', async () => {
    mockGitService.isGitRepository.mockResolvedValue(true);
    mockGitService.getStatus.mockResolvedValue([{ path: 'file.txt', status: 'M' }]);
    mockGitService.getStagedFiles.mockResolvedValue(['file.txt']);

    await autoCommit('.', { all: true, message: 'custom message' });

    expect(mockGitService.commit).toHaveBeenCalledWith('custom message');
  });

  it('should push changes when --push is specified', async () => {
    mockGitService.isGitRepository.mockResolvedValue(true);
    mockGitService.getStatus.mockResolvedValue([{ path: 'file.txt', status: 'M' }]);
    mockGitService.getStagedFiles.mockResolvedValue(['file.txt']);
    mockGitService.generateCommitMessage.mockResolvedValue('update: 1 file');
    mockGitService.getCurrentBranch.mockResolvedValue('main');

    await autoCommit('.', { all: true, push: true });

    expect(mockGitService.push).toHaveBeenCalledWith('origin', 'main');
  });

  it('should throw error when neither --all nor --pattern is specified', async () => {
    mockGitService.isGitRepository.mockResolvedValue(true);
    mockGitService.getStatus.mockResolvedValue([{ path: 'file.txt', status: 'M' }]);

    await expect(autoCommit('.', {})).rejects.toThrow('Must specify --all or --pattern');
  });
});
