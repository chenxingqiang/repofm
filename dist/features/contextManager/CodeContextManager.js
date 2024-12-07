import { extractCodeContext } from './implementation.js';
import { FilePersistentCache } from './cache/persistentCache.js';
export class CodeContextManager {
    constructor(config) {
        this._config = {
            ...config,
            ignore: {
                ...config.ignore,
                useDefaultPatterns: true,
                customPatterns: config.ignore.customPatterns || [],
                excludePatterns: config.ignore.excludePatterns || []
            }
        };
        this._cache = new FilePersistentCache();
        this._metrics = {
            operationLatency: 0
        };
        this._contextStack = [];
    }
    static getInstance(config) {
        if (!this._instance) {
            if (!config) {
                throw new Error('Initial configuration is required to create CodeContextManager');
            }
            this._instance = new CodeContextManager(config);
        }
        return this._instance;
    }
    getConfig() {
        return { ...this._config };
    }
    pushContext(context) {
        this._contextStack.push({ ...this._config });
        this._config = {
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
        if (this._contextStack.length > 0) {
            this._config = this._contextStack.pop();
        }
    }
    async getContext(target, type, depth) {
        const cacheKey = `${target}:${type}:${depth}`;
        // Try to get from cache first
        const cachedContext = await this._cache.get(cacheKey);
        if (cachedContext) {
            return cachedContext;
        }
        // If not in cache, extract context
        const context = await extractCodeContext(target, type, depth, this._config);
        // Store in cache for future use
        await this._cache.set(cacheKey, context);
        return context;
    }
    async clearCache() {
        await this._cache.clear();
    }
    recordLatency(latency) {
        this._metrics.operationLatency = latency;
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
CodeContextManager._instance = null;
//# sourceMappingURL=CodeContextManager.js.map