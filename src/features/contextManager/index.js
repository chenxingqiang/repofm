// src/features/contextManager/index.js
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as fs from 'fs/promises'
import * as path from 'path'
import { transformFromAst } from '@babel/core'
import { createSourceFile, ScriptTarget, SyntaxKind } from 'typescript'
// src/features/contextManager/index.js
// Update the CodeContextManager to use GitIgnoreHandler

import { GitIgnoreHandler } from '../../utils/gitignore'



export class CodeContextManager {
    constructor(config = {}) {
      this.config = {
        outputFormat: config.outputFormat || 'markdown',
        maxDepth: config.maxDepth || 2,
        includeImports: config.includeImports ?? true,
        includeExports: config.includeExports ?? true,
        maxContextLines: config.maxContextLines || 100,
        excludePatterns: config.excludePatterns || [/node_modules/, /\.git/]
      }

        this.gitIgnoreHandler = new GitIgnoreHandler({
            enabled: config.respectGitIgnore ?? true,
            customIgnores: config.customIgnores,
            rootDir: config.rootDir || process.cwd()
        })
    }

    async initialize() {
        await this.gitIgnoreHandler.initialize()
    }

  async getContext({ target, type, depth = 1, file = null }) {
    // Check if the target file should be ignored
    if (file && this.gitIgnoreHandler.shouldIgnore(file)) {
      throw new Error('Target file is ignored by .gitignore rules')
    }

  }
    /**
     * Main entry point for getting code context
     */
    async getContext({ target, type, depth = 1, file = null }) {
        try {
            const context = await this.extractContext(target, type, depth, file)
            return this.formatOutput(context)
        } catch (error) {
            throw new Error(`Failed to get context: ${error.message}`)
        }
    }

    async getFileContext(filePath, depth) {
        // Filter out ignored dependencies
        const context = await super.getFileContext(filePath, depth)

        if (context.dependencies) {
            context.dependencies = this.gitIgnoreHandler.filterPaths(context.dependencies)
        }

        return context
    }

    async searchContext({ query, path: searchPath, type }) {
        const results = await super.searchContext({ query, path: searchPath, type })

        // Filter out results from ignored files
        return results.filter((result) => !this.gitIgnoreHandler.shouldIgnore(result.file))
    }

    /**
     * Extract context based on type
     */
    async extractContext(target, type, depth, file) {
        const contextData = {
            type,
            target,
            content: null,
            references: [],
            dependencies: [],
            timestamp: new Date().toISOString()
        }

        switch (type) {
            case 'function':
                contextData.content = await this.getFunctionContext(target, file, depth)
                break
            case 'file':
                contextData.content = await this.getFileContext(target, depth)
                break
            case 'character':
                contextData.content = await this.getCharacterContext(target, file, depth)
                break
            default:
                throw new Error(`Unsupported context type: ${type}`)
        }

        return contextData
    }

    /**
     * Get context for a specific function
     */
    async getFunctionContext(functionName, filePath, depth) {
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const ast = parse(fileContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'decorators-legacy']
        })

        const context = {
            definition: null,
            callers: [],
            dependencies: [],
            tests: []
        }

        // Find function definition
        traverse(ast, {
            FunctionDeclaration(path) {
                if (path.node.id.name === functionName) {
                    context.definition = this.extractFunctionDefinition(path)
                }
            },
            CallExpression(path) {
                if (path.node.callee.name === functionName) {
                    context.callers.push(this.extractCaller(path))
                }
            }
        })

        if (depth > 1) {
            context.dependencies = await this.findDependencies(filePath, functionName)
            context.tests = await this.findRelatedTests(filePath, functionName)
        }

        return context
    }

    /**
     * Get context for an entire file
     */
    async getFileContext(filePath, depth) {
        const content = await fs.readFile(filePath, 'utf-8')
        const sourceFile = createSourceFile(filePath, content, ScriptTarget.Latest, true)

        const context = {
            content,
            imports: [],
            exports: [],
            functions: [],
            classes: [],
            dependencies: []
        }

        // Extract imports and exports
        if (this.config.includeImports) {
            context.imports = this.extractImports(sourceFile)
        }

        if (this.config.includeExports) {
            context.exports = this.extractExports(sourceFile)
        }

        // Extract functions and classes
        sourceFile.forEachChild((node) => {
            if (node.kind === SyntaxKind.FunctionDeclaration) {
                context.functions.push(this.extractFunctionInfo(node))
            } else if (node.kind === SyntaxKind.ClassDeclaration) {
                context.classes.push(this.extractClassInfo(node))
            }
        })

        if (depth > 1) {
            context.dependencies = await this.findFileDependencies(filePath)
        }

        return context
    }

    /**
     * Get context for a specific character position
     */
    async getCharacterContext(position, filePath, depth) {
        const content = await fs.readFile(filePath, 'utf-8')
        const lines = content.split('\n')

        const { line, column } = this.getLineAndColumn(position, content)

        const context = {
            line,
            column,
            snippet: this.extractSnippet(lines, line, this.config.maxContextLines),
            scope: await this.findScope(filePath, line, column),
            references: []
        }

        if (depth > 1) {
            context.references = await this.findReferences(filePath, line, column)
        }

        return context
    }

    /**
     * Format output based on configured format
     */
    formatOutput(context) {
        switch (this.config.outputFormat) {
            case 'markdown':
                return this.toMarkdown(context)
            case 'xml':
                return this.toXML(context)
            case 'json':
                return JSON.stringify(context, null, 2)
            default:
                return this.toPlainText(context)
        }
    }

    /**
     * Convert context to Markdown format
     */
    toMarkdown(context) {
        let md = `# Code Context: ${context.target}\n\n`

        md += `## Type: ${context.type}\n\n`

        if (context.content.definition) {
            md += '## Definition\n\n```javascript\n'
            md += context.content.definition
            md += '\n```\n\n'
        }

        if (context.content.dependencies?.length > 0) {
            md += '## Dependencies\n\n'
            context.content.dependencies.forEach((dep) => {
                md += `- ${dep}\n`
            })
            md += '\n'
        }

        // Add more sections based on context type

        return md
    }

    /**
     * Convert context to XML format
     */
    toXML(context) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<codeContext>\n'
        xml += `  <target>${this.escapeXml(context.target)}</target>\n`
        xml += `  <type>${context.type}</type>\n`

        // Add content based on type
        xml += '  <content>\n'
        if (context.content.definition) {
            xml += `    <definition><![CDATA[${context.content.definition}]]></definition>\n`
        }
        // Add more content sections

        xml += '  </content>\n'
        xml += '</codeContext>'

        return xml
    }

    /**
     * Utility functions
     */
    async findDependencies(filePath, functionName) {
        // Implementation to find function dependencies
    }

    async findRelatedTests(filePath, functionName) {
        // Implementation to find related test files
    }

    extractFunctionDefinition(path) {
        // Implementation to extract function definition
    }

    extractCaller(path) {
        // Implementation to extract caller information
    }

    extractImports(sourceFile) {
        // Implementation to extract imports
    }

    extractExports(sourceFile) {
        // Implementation to extract exports
    }

    getLineAndColumn(position, content) {
        // Implementation to convert position to line and column
    }

    extractSnippet(lines, line, maxLines) {
        // Implementation to extract code snippet
    }

    escapeXml(str) {
        // Implementation to escape XML special characters
    }
}

// src/features/contextManager/formatters/index.js
export class ContextFormatter {
    static toMarkdown(context) {
        // Implementation of markdown formatting
    }

    static toXML(context) {
        // Implementation of XML formatting
    }

    static toPlainText(context) {
        // Implementation of plain text formatting
    }
}

// src/features/contextManager/parsers/index.js
export class ContextParser {
    static parseFunction(ast, functionName) {
        // Implementation of function parsing
    }

    static parseFile(sourceFile) {
        // Implementation of file parsing
    }

    static parseCharacterPosition(content, position) {
        // Implementation of character position parsing
    }
}
