// src/features/autoCommit/enhancedTemplates.js
import { parse } from '@babel/parser'
import { File } from '@babel/types'
import traverse from '@babel/traverse'

export class CommitMessageGenerator {
    constructor(config = {}) {
        this.config = {
            useAI: config.useAI ?? true,
            maxContextLines: config.maxContextLines ?? 100,
            includeScope: config.includeScope ?? true,
            ...config
        }

        // Advanced template categories
        this.templateCategories = {
            feature: {
                api: {
                    template: 'feat(api): implement {} endpoint for {}',
                    keywords: ['endpoint', 'api', 'route', 'controller'],
                    files: ['controller', 'route', 'api']
                },
                ui: {
                    template: 'feat(ui): add {} component with {}',
                    keywords: ['component', 'view', 'page', 'react', 'vue'],
                    files: ['jsx', 'tsx', 'vue', 'component']
                },
                auth: {
                    template: 'feat(auth): implement {} authentication flow',
                    keywords: ['auth', 'login', 'register', 'jwt'],
                    files: ['auth', 'security']
                },
                database: {
                    template: 'feat(db): add {} model and migrations',
                    keywords: ['model', 'schema', 'migration', 'database'],
                    files: ['model', 'migration', 'schema']
                }
            },
            fix: {
                security: {
                    template: 'fix(security): patch {} vulnerability in {}',
                    keywords: ['security', 'vulnerability', 'exploit', 'cve'],
                    priority: 'high'
                },
                performance: {
                    template: 'fix(perf): optimize {} performance in {}',
                    keywords: ['performance', 'slow', 'optimization', 'speed'],
                    priority: 'medium'
                },
                validation: {
                    template: 'fix(validation): correct {} validation in {}',
                    keywords: ['validation', 'validator', 'check', 'verify'],
                    priority: 'medium'
                }
            },
            refactor: {
                architecture: {
                    template: 'refactor(arch): restructure {} implementation',
                    keywords: ['architecture', 'structure', 'pattern'],
                    scope: 'architecture'
                },
                cleanup: {
                    template: 'refactor(cleanup): improve {} code organization',
                    keywords: ['cleanup', 'organize', 'simplify'],
                    scope: 'cleanup'
                }
            }
        }
    }

    /**
     * Analyze code changes for context
     */
    async analyzeChanges(filePath, diff) {
        const analysis = {
            type: null,
            scope: null,
            details: [],
            impact: 'normal',
            relatedFiles: [],
            suggestions: []
        }

        // Parse code if it's a JavaScript/TypeScript file
        if (/\.(js|ts|jsx|tsx)$/.test(filePath)) {
            try {
                const ast = parse(diff, {
                    sourceType: 'module',
                    plugins: ['jsx', 'typescript', 'decorators-legacy']
                })

                // Analyze AST for specific changes
                traverse(ast, {
                    FunctionDeclaration(path) {
                        analysis.details.push({
                            type: 'function',
                            name: path.node.id.name,
                            isNew: true
                        })
                    },
                    ClassDeclaration(path) {
                        analysis.details.push({
                            type: 'class',
                            name: path.node.id.name,
                            isNew: true
                        })
                    },
                    ImportDeclaration(path) {
                        analysis.details.push({
                            type: 'import',
                            source: path.node.source.value
                        })
                    }
                })
            } catch (error) {
                // Fallback to basic analysis if parsing fails
                console.warn(`AST parsing failed for ${filePath}:`, error.message)
            }
        }

        return analysis
    }

    /**
     * Generate appropriate commit message based on changes
     */
    async generateMessage(filePath, diff, analysis) {
        let message = ''
        let scope = ''
        let type = ''

        // Determine the most appropriate template category
        for (const [category, templates] of Object.entries(this.templateCategories)) {
            for (const [key, config] of Object.entries(templates)) {
                if (this.matchesTemplate(diff, config.keywords) || this.matchesFilePattern(filePath, config.files)) {
                    type = category
                    scope = key
                    message = this.applyTemplate(config.template, analysis)
                    break
                }
            }
            if (message) break
        }

        // Fallback to basic template if no specific match found
        if (!message) {
            type = this.determineType(analysis)
            scope = this.determineScope(filePath)
            message = this.generateBasicMessage(type, scope, filePath)
        }

        // Add breaking change footer if necessary
        if (this.isBreakingChange(diff, analysis)) {
            message += '\n\nBREAKING CHANGE: '
            message += await this.generateBreakingChangeDescription(analysis)
        }

        return {
            type,
            scope,
            message,
            analysis
        }
    }

    /**
     * Check for breaking changes
     */
    isBreakingChange(diff, analysis) {
        const breakingPatterns = [
            /BREAKING CHANGE/i,
            /breaking-change/i,
            /incompatible/i,
            /\bapi\b.*\bchange\b/i,
            /\bremove(d)?\b.*\bapi\b/i,
            /\bdelete(d)?\b.*\bapi\b/i,
            /\bdeprecate(d)?\b/i
        ]

        return breakingPatterns.some((pattern) => pattern.test(diff)) || analysis.impact === 'high'
    }

    /**
     * Generate description for breaking changes
     */
    async generateBreakingChangeDescription(analysis) {
        let description = ''

        if (analysis.details.length > 0) {
            description = analysis.details
                .filter((d) => d.isBreaking)
                .map((d) => {
                    switch (d.type) {
                        case 'function':
                            return `Function ${d.name} signature has changed`
                        case 'class':
                            return `Class ${d.name} interface has been modified`
                        case 'api':
                            return `API endpoint ${d.name} has been restructured`
                        default:
                            return `${d.type} ${d.name} has breaking changes`
                    }
                })
                .join('\n')
        }

        return description || 'Major changes that break existing functionality'
    }

    /**
     * Helper methods
     */
    matchesTemplate(content, keywords) {
        return keywords.some((keyword) => new RegExp(keyword, 'i').test(content))
    }

    matchesFilePattern(filePath, patterns) {
        return patterns.some((pattern) => new RegExp(pattern, 'i').test(filePath))
    }

    applyTemplate(template, analysis) {
        // Replace placeholders with actual values
        return template.replace('{}', analysis.scope || 'component').replace('{}', this.generateDescription(analysis))
    }

    generateDescription(analysis) {
        if (analysis.details.length > 0) {
            return analysis.details.map((d) => d.name).join(', ')
        }
        return 'implementation'
    }

    determineType(analysis) {
        // Logic to determine commit type based on analysis
        if (analysis.details.some((d) => d.isNew)) return 'feat'
        if (analysis.details.some((d) => d.isFix)) return 'fix'
        return 'chore'
    }

    determineScope(filePath) {
        const scopePatterns = {
            api: /api|controller|route/i,
            ui: /component|view|page/i,
            auth: /auth|login|security/i,
            db: /model|migration|database/i,
            test: /test|spec/i
        }

        for (const [scope, pattern] of Object.entries(scopePatterns)) {
            if (pattern.test(filePath)) return scope
        }

        return ''
    }
}
