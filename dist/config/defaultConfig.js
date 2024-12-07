export const defaultConfig = {
    output: {
        filePath: '',
        style: 'markdown',
        removeComments: false,
        removeEmptyLines: false,
        showLineNumbers: false,
        copyToClipboard: false,
        topFilesLength: 10,
        headerText: 'Repository Content',
        instructionFilePath: 'instructions.md'
    },
    include: ['**/*'],
    ignore: {
        customPatterns: [],
        useDefaultPatterns: true,
        useGitignore: true,
        excludePatterns: ['node_modules/**', '.git/**', '*.log']
    },
    security: {
        enableSecurityCheck: false
    }
};
//# sourceMappingURL=defaultConfig.js.map