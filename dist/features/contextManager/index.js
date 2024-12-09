import { minimatch } from 'minimatch.js';
class CodeContextManager {
    constructor(config) {
        this.contextStack = [];
        this.cache = new Map();
        this.performanceMetrics = { operationLatency: 0 };
        if (!config?.workspaceRoot) {
            throw new Error('Workspace root is required for initialization');
        }
        this.config = config;
    }
    static getInstance(config) {
        if (!CodeContextManager.instance && config) {
            CodeContextManager.instance = new CodeContextManager(config);
        }
        else if (!CodeContextManager.instance && !config) {
            throw new Error('Workspace root is required for initialization');
        }
        return CodeContextManager.instance;
    }
    static resetInstance() {
        CodeContextManager.instance = null;
    }
    getConfig() {
        return this.config;
    }
    setCacheValue(key, value) {
        this.cache.set(key, value);
    }
    getCacheValue(key) {
        return this.cache.get(key);
    }
    recordOperationLatency(latency) {
        this.performanceMetrics.operationLatency = latency;
    }
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }
    pushContext(newContext) {
        this.contextStack.push(this.config);
        this.config = { ...this.config, ...newContext };
    }
    popContext() {
        const previousContext = this.contextStack.pop();
        if (previousContext) {
            this.config = previousContext;
        }
    }
    async withTemporaryContext(tempContext, operation) {
        this.pushContext(tempContext);
        try {
            return await operation();
        }
        finally {
            this.popContext();
        }
    }
    isValidSourceFile(filePath) {
        const { excludePatterns = [] } = this.config;
        // Normalize path separators to forward slashes
        const normalizedPath = filePath.replace(/\\/g, '/');
        // Check if the path matches any exclude pattern
        return !excludePatterns.some(pattern => {
            const normalizedPattern = pattern.replace(/\\/g, '/');
            return minimatch(normalizedPath, normalizedPattern, {
                dot: true,
                nocase: this.config.ignoreCase,
                matchBase: false,
                windowsPathsNoEscape: true
            });
        });
    }
}
CodeContextManager.instance = null;
export { CodeContextManager };
export default CodeContextManager;
