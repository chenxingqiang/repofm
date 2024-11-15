// src/features/contextManager.js
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as fs from 'fs/promises'

export class CodeContextManager {
    constructor(config) {
        this.outputFormat = config.outputFormat || 'markdown'
    }

    async getContext({ target, type, depth = 1, includeImports = true }) {
        const context = await this.extractContext(target, type, depth)
        return this.formatOutput(context)
    }

    async extractContext(target, type, depth) {
        switch (type) {
            case 'function':
                return this.getFunctionContext(target, depth)
            case 'file':
                return this.getFileContext(target, depth)
            case 'character':
                return this.getCharacterContext(target, depth)
            default:
                throw new Error(`Unsupported context type: ${type}`)
        }
    }

    formatOutput(context) {
        switch (this.outputFormat) {
            case 'markdown':
                return this.toMarkdown(context)
            case 'xml':
                return this.toXML(context)
            default:
                return this.toPlainText(context)
        }
    }
}
