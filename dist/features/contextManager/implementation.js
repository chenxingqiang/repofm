import fs from 'node:fs/promises';
import path from 'node:path';
export async function extractCodeContext(target, type, depth, config) {
    try {
        const absoluteTarget = path.isAbsolute(target)
            ? target
            : path.resolve(config.cwd || process.cwd(), target);
        const content = await fs.readFile(absoluteTarget, 'utf-8');
        return {
            content,
            type,
            path: target,
            size: content.length
        };
    }
    catch (error) {
        console.error('Error extracting code context:', error);
        throw error;
    }
}
export class CodeContextManager {
    constructor(config) {
        this.contextStack = [];
        if (!config) {
            throw new Error('Configuration is required');
        }
        this.config = config;
    }
    static getInstance(config) {
        if (!this.instance && config) {
            this.instance = new CodeContextManager(config);
        }
        return this.instance;
    }
    static resetInstance() {
        this.instance = null;
    }
    getConfig() {
        return { ...this.config };
    }
    getPerformanceMetrics() {
        return { ...this.config.metrics };
    }
    setCacheValue(key, value) {
        this.config.cache.set(key, value);
    }
    getCacheValue(key) {
        return this.config.cache.get(key);
    }
    recordOperationLatency(latency) {
        this.config.metrics.operationLatency = latency;
    }
    pushContext(context) {
        this.contextStack.push({ ...this.config });
        this.config = {
            ...context,
            ignore: {
                ...context.ignore,
                useDefaultPatterns: true,
                customPatterns: context.ignore.customPatterns,
                excludePatterns: context.ignore.excludePatterns
            }
        };
    }
    popContext() {
        const previousContext = this.contextStack.pop();
        if (previousContext) {
            this.config = previousContext;
            return previousContext;
        }
        return undefined;
    }
    getCurrentContext() {
        return { ...this.config };
    }
    isValidSourceFile(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const excludePatterns = this.config.ignore.excludePatterns || [];
        const customPatterns = this.config.ignore.customPatterns || [];
        const allPatterns = [...excludePatterns, ...customPatterns];
        for (const pattern of allPatterns) {
            // Handle special patterns first
            if (pattern === 'node_modules/**' && (normalizedPath.startsWith('node_modules/') || normalizedPath.includes('/node_modules/'))) {
                return false;
            }
            // Handle brace expansion patterns
            if (pattern.includes('{') && pattern.includes('}')) {
                const parts = pattern.match(/\{([^}]+)\}/);
                if (parts) {
                    const options = parts[1].split(',');
                    const basePattern = pattern.replace(/\{[^}]+\}/, '([^/]*)');
                    for (const option of options) {
                        const fullPattern = basePattern.replace(/\([^/]*\)/, option.trim());
                        if (this.matchPattern(normalizedPath, fullPattern)) {
                            return false;
                        }
                    }
                }
            }
            // Handle standard glob patterns
            if (this.matchPattern(normalizedPath, pattern)) {
                return false;
            }
        }
        return true;
    }
    matchPattern(path, pattern) {
        // Simple pattern matching logic
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(path);
    }
    async withTemporaryContext(context, callback) {
        this.pushContext(context);
        try {
            return await callback();
        }
        finally {
            this.popContext();
        }
    }
    async getContext(target, type, depth) {
        const cacheKey = `${target}:${type}:${depth}`;
        // Try to get from cache first
        const cachedContext = await this.getCacheValue(cacheKey);
        if (cachedContext) {
            return cachedContext;
        }
        // If not in cache, extract context
        const context = await extractCodeContext(target, type, depth, this.config);
        // Store in cache for future use
        await this.setCacheValue(cacheKey, context);
        return context;
    }
    async clearCache() {
        this.config.cache.clear();
    }
    withContext(context, operation) {
        try {
            this.pushContext(context);
            return operation();
        }
        finally {
            this.popContext();
        }
    }
}
CodeContextManager.instance = null;
export default CodeContextManager;
