import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import { jest, afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { createConfigFile, createIgnoreFile } from '../../../src/cli/actions/initAction.js';
import { getGlobalDirectory } from '../../../src/config/globalDirectory.js';

jest.mock('node:fs');
jest.mock('@clack/prompts');
jest.mock('../../../src/shared/folderUtils');
jest.mock('../../../src/config/globalDirectory.js');

describe('initAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createConfigFile', () => {
    it('should create a new local config file when one does not exist', async () => {
      jest.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
      jest.mocked(prompts.group).mockResolvedValue({
        outputFilePath: 'custom-output.txt',
        outputStyle: 'xml',
      });
      jest.mocked(prompts.confirm).mockResolvedValue(true);

      await createConfigFile('/test/dir', false);

      const configPath = path.resolve('/test/dir/repofm.config.json');

      console.log('configPath', configPath);

      expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"filePath": "custom-output.txt"'));
      expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"style": "xml"'));
    });

    it('should create a new global config file when one does not exist', async () => {
      jest.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
      jest.mocked(prompts.group).mockResolvedValue({
        outputFilePath: 'global-output.txt',
        outputStyle: 'plain',
      });
      jest.mocked(prompts.confirm).mockResolvedValue(true);
      jest.mocked(getGlobalDirectory).mockImplementation(() => '/global/repofm');

      await createConfigFile('/test/dir', true);

      const configPath = path.resolve('/global/repofm/repofm.config.json');

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(configPath), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"filePath": "global-output.txt"'));
      expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"style": "plain"'));
    });

    it('should prompt to overwrite when config file already exists', async () => {
      jest.mocked(fs.access).mockResolvedValue(undefined);
      jest.mocked(prompts.confirm).mockResolvedValue(true);
      jest.mocked(prompts.group).mockResolvedValue({
        outputFilePath: 'new-output.txt',
        outputStyle: 'xml',
      });

      await createConfigFile('/test/dir', false);

      expect(prompts.confirm).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should not overwrite when user chooses not to', async () => {
      jest.mocked(fs.access).mockResolvedValue(undefined);
      jest.mocked(prompts.confirm).mockResolvedValue(false);

      await createConfigFile('/test/dir', false);

      expect(prompts.confirm).toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle user cancellation', async () => {
      jest.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
      jest.mocked(prompts.group).mockImplementation(() => {
        throw new Error('User cancelled');
      });

      await createConfigFile('/test/dir', false);

      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('createIgnoreFile', () => {
    it('should not create a new .repofmignore file when global flag is set', async () => {
      const result = await createIgnoreFile('/test/dir', true);

      expect(result).toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should create a new .repofmignore file when one does not exist', async () => {
      jest.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
      jest.mocked(prompts.confirm).mockResolvedValue(true);

      await createIgnoreFile('/test/dir', false);

      const ignorePath = path.resolve('/test/dir/.repofmignore');

      expect(fs.writeFile).toHaveBeenCalledWith(
        ignorePath,
        expect.stringContaining('# Add patterns to ignore here, one per line'),
      );
    });

    it('should prompt to overwrite when .repofmignore file already exists', async () => {
      jest.mocked(fs.access).mockResolvedValue(undefined);
      jest.mocked(prompts.confirm)
        .mockResolvedValueOnce(true) // First call for creating the file
        .mockResolvedValueOnce(true); // Second call for overwriting

      await createIgnoreFile('/test/dir', false);

      expect(prompts.confirm).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should not overwrite when user chooses not to', async () => {
      jest.mocked(fs.access).mockResolvedValue(undefined);
      jest.mocked(prompts.confirm)
        .mockResolvedValueOnce(true) // First call for creating the file
        .mockResolvedValueOnce(false); // Second call for overwriting

      await createIgnoreFile('/test/dir', false);

      expect(prompts.confirm).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should return false when user chooses not to create .repofmignore', async () => {
      jest.mocked(prompts.confirm).mockResolvedValue(false);

      const result = await createIgnoreFile('/test/dir', false);

      expect(result).toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle user cancellation', async () => {
      jest.mocked(prompts.confirm).mockResolvedValue(false);

      await createIgnoreFile('/test/dir', false);

      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});
