// src/features/autoCommit/contentAnalyzer.js
export class ContentAnalyzer {
    constructor() {
        this.patterns = {
            security: /security|vulnerability|cve|exploit/i,
            performance: /performance|optimize|speed|memory|cpu/i,
            bugfix: /fix|bug|issue|error|crash|problem/i,
            feature: /feat|feature|add|implement|new/i,
            refactor: /refactor|restructure|clean|improve|simplify/i,
            style: /style|css|scss|less|theme|ui|layout/i,
            docs: /docs|documentation|comment|readme/i,
            test: /test|spec|coverage|assert|expect/i
        }
    }

    async analyzeContent(filePath, content) {
        const analysis = {
            type: null,
            scope: null,
            importance: 0,
            suggestions: []
        }

        // Analyze file content
        for (const [type, pattern] of Object.entries(this.patterns)) {
            if (pattern.test(content)) {
                analysis.suggestions.push(type)
            }
        }

        // Analyze file path
        for (const [type, config] of Object.entries(fileTypePatterns)) {
            if (config.pattern.test(filePath)) {
                analysis.type = type
                analysis.scope = config.scope
            }

            if (config.folders.some((folder) => filePath.includes(folder))) {
                analysis.scope = config.scope
            }

            if (config.keywords?.some((keyword) => content.includes(keyword))) {
                analysis.importance++
            }
        }

        return analysis
    }
}
