import { vi } from 'vitest.js';
export const createMockLogger = () => ({
    log: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn()
});
export function createTestConfig(overrides = {}) {
    const defaultConfig = {
        cwd: process.cwd(),
        output: {
            filePath: 'output.txt',
            style: 'plain',
            headerText: 'Test Header',
            topFilesLength: 5,
            showLineNumbers: false,
            removeComments: false,
            removeEmptyLines: false,
            copyToClipboard: false,
            instructionFilePath: 'instructions.md'
        },
        ignore: {
            useGitignore: true,
            useDefaultPatterns: true,
            customPatterns: [],
            excludePatterns: ['node_modules/**', '*.log']
        },
        security: {
            enableSecurityCheck: true
        },
        include: []
    };
    return {
        ...defaultConfig,
        ...overrides,
        output: {
            ...defaultConfig.output,
            ...(overrides.output || {})
        },
        ignore: {
            ...defaultConfig.ignore,
            ...(overrides.ignore || {})
        },
        security: {
            ...defaultConfig.security,
            ...(overrides.security || {})
        }
    };
}
