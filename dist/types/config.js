// Helper function to normalize ignore config
export const normalizeIgnoreConfig = (ignore) => {
    if (Array.isArray(ignore)) {
        return {
            customPatterns: ignore,
            useDefaultPatterns: true,
            useGitignore: true,
            excludePatterns: [],
        };
    }
    return ignore;
};
//# sourceMappingURL=config.js.map