// Helper function to normalize ignore config
export const normalizeIgnoreConfig = (ignore) => {
    if (Array.isArray(ignore)) {
        return {
            customPatterns: ignore,
            useDefaultPatterns: true,
            useGitignore: true,
        };
    }
    return ignore;
};
//# sourceMappingURL=config.js.map