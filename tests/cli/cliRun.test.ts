// tests/cli/cliRun.test.ts

import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import clipboardy from 'clipboardy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runDefaultAction } from '../../src/cli/actions/defaultAction';
import { runInitAction } from '../../src/cli/actions/initAction';
import { runMigrationAction } from '../../src/cli/actions/migrationAction';
import { runRemoteAction } from '../../src/cli/actions/remoteAction';
import { runVersionAction } from '../../src/cli/actions/versionAction';
import { run } from '../../src/cli/cliRun';
import * as configLoader from '../../src/config/configLoad';
import * as packageJsonParser from '../../src/core/file/packageJsonParse';
import { logger } from '../../src/shared/logger';

vi.mock('node:fs/promises');
vi.mock('clipboardy');
vi.mock('../../src/cli/actions/defaultAction');
vi.mock('../../src/cli/actions/initAction');
vi.mock('../../src/cli/actions/migrationAction');
vi.mock('../../src/cli/actions/remoteAction');
vi.mock('../../src/cli/actions/versionAction');
vi.mock('../../src/config/configLoad');
vi.mock('../../src/core/file/packageJsonParse');
vi.mock('../../src/shared/logger');

describe('CLI', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.argv = ['node', 'repofm']; // Reset process.argv
        vi.mocked(packageJsonParser.getVersion).mockResolvedValue('1.0.0');
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Basic Commands', () => {
        it('should show version when --version flag is used', async () => {
            process.argv.push('--version');
            await run();
            expect(runVersionAction).toHaveBeenCalled();
        });

        it('should run init command with --init flag', async () => {
            process.argv.push('--init');
            await run();
            expect(runInitAction).toHaveBeenCalled();
        });

        it('should process remote repository with --remote flag', async () => {
            process.argv.push('--remote', 'https://github.com/user/repo.git');
            await run();
            expect(runRemoteAction).toHaveBeenCalled();
        });

        it('should run default action without flags', async () => {
            await run();
            expect(runDefaultAction).toHaveBeenCalled();
        });
    });

    describe('Configuration Options', () => {
        it('should handle custom output file path', async () => {
            process.argv.push('-o', 'custom-output.txt');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    output: 'custom-output.txt'
                })
            );
        });

        it('should handle custom config file', async () => {
            process.argv.push('-c', 'custom-config.json');
            await run();
            expect(configLoader.loadFileConfig).toHaveBeenCalledWith(
                expect.any(String),
                'custom-config.json'
            );
        });

        it('should handle include patterns', async () => {
            process.argv.push('--include', '*.js,*.ts');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    include: '*.js,*.ts'
                })
            );
        });

        it('should handle ignore patterns', async () => {
            process.argv.push('-i', '*.test.js,*.spec.ts');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    ignore: '*.test.js,*.spec.ts'
                })
            );
        });

        it('should handle output style option', async () => {
            process.argv.push('--style', 'xml');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    style: 'xml'
                })
            );
        });

        it('should handle line numbers option', async () => {
            process.argv.push('--output-show-line-numbers');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    outputShowLineNumbers: true
                })
            );
        });
    });

    describe('Global Options', () => {
        it('should handle verbose mode', async () => {
            process.argv.push('--verbose');
            await run();
            expect(logger.setVerbose).toHaveBeenCalledWith(true);
        });

        it('should handle global init', async () => {
            process.argv.push('--init', '--global');
            await run();
            expect(runInitAction).toHaveBeenCalledWith(
                expect.any(String),
                true
            );
        });
    });

    describe('Clipboard Integration', () => {
        it('should copy output to clipboard when requested', async () => {
            process.argv.push('--copy');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    copy: true
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid command line arguments', async () => {
            process.argv.push('--invalid-flag');
            await run();
            expect(logger.error).toHaveBeenCalled();
        });

        it('should handle missing required arguments', async () => {
            process.argv.push('--remote'); // Missing repository URL
            await run();
            expect(logger.error).toHaveBeenCalled();
        });

        it('should handle file system errors', async () => {
            vi.mocked(runDefaultAction).mockRejectedValue(new Error('File system error'));
            await run();
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('Directory Handling', () => {
        it('should handle custom directory argument', async () => {
            process.argv.push('custom/directory');
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                'custom/directory',
                expect.any(String),
                expect.any(Object)
            );
        });

        it('should use current directory by default', async () => {
            await run();
            expect(runDefaultAction).toHaveBeenCalledWith(
                '.',
                expect.any(String),
                expect.any(Object)
            );
        });
    });

    describe('Performance', () => {
        it('should handle command execution timing', async () => {
            const startTime = Date.now();
            await run();
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe('Integration Tests', () => {
        it('should execute CLI with actual file system', async () => {
            const testDir = await fs.mkdtemp('repofm-test-');
            try {
                // Create test files
                await fs.writeFile(path.join(testDir, 'test.js'), 'console.log("test");');
                await fs.writeFile(path.join(testDir, 'test.css'), 'body { color: red; }');

                // Run CLI with test directory
                const output = execSync(`node bin/repofm ${testDir}`, {
                    encoding: 'utf8',
                });

                expect(output).toContain('test.js');
                expect(output).toContain('test.css');
            } finally {
                await fs.rm(testDir, { recursive: true });
            }
        });

        it('should respect project configuration', async () => {
            const testDir = await fs.mkdtemp('repofm-test-');
            try {
                // Create test configuration
                await fs.writeFile(path.join(testDir, 'repofm.config.json'), JSON.stringify({
                    output: {
                        style: 'xml',
                        removeComments: true
                    }
                }));

                // Create test file
                await fs.writeFile(path.join(testDir, 'test.js'), '// Comment\ncode');

                // Run CLI
                const output = execSync(`node bin/repofm ${testDir}`, {
                    encoding: 'utf8',
                });

                expect(output).toContain('<file');
                expect(output).not.toContain('// Comment');
            } finally {
                await fs.rm(testDir, { recursive: true });
            }
        });
    });

    describe('Migration Handling', () => {
        it('should handle migration when old config exists', async () => {
            vi.mocked(runMigrationAction).mockResolvedValue({
                configMigrated: true,
                ignoreMigrated: true,
                instructionMigrated: false,
                outputFilesMigrated: [],
                globalConfigMigrated: false,
            });

            await run();
            expect(runMigrationAction).toHaveBeenCalled();
        });

        it('should skip migration when no old config exists', async () => {
            vi.mocked(runMigrationAction).mockResolvedValue({
                configMigrated: false,
                ignoreMigrated: false,
                instructionMigrated: false,
                outputFilesMigrated: [],
                globalConfigMigrated: false,
            });

            await run();
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining('No Repopack files found to migrate')
            );
        });
    });

    describe('Remote Repository Handling', () => {
        it('should handle GitHub shorthand syntax', async () => {
            process.argv.push('--remote', 'user/repo');
            await run();
            expect(runRemoteAction).toHaveBeenCalledWith(
                'user/repo',
                expect.any(Object)
            );
        });

        it('should handle full repository URLs', async () => {
            process.argv.push('--remote', 'https://github.com/user/repo.git');
            await run();
            expect(runRemoteAction).toHaveBeenCalledWith(
                'https://github.com/user/repo.git',
                expect.any(Object)
            );
        });
    });

    describe('Help Command', () => {
        it('should display help information', async () => {
            process.argv.push('--help');
            const consoleLogSpy = vi.spyOn(console, 'log');
            await run();
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining('Usage:')
            );
        });
    });
});
