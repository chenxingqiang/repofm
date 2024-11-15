// src/utils/gitignore.js
import ignore from 'ignore'
import * as fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'

export class GitIgnoreHandler {
    constructor(options = {}) {
        this.enabled = options.enabled ?? true
        this.ignoreInstance = ignore()
        this.customIgnores = options.customIgnores || []
        this.cached = new Map()
        this.rootDir = options.rootDir || process.cwd()
    }

    /**
     * Initialize the handler by loading all .gitignore files
     */
    async initialize() {
        try {
            // Load root .gitignore
            await this.loadGitIgnore(this.rootDir)

            // Load all .gitignore files in subdirectories
            const gitignoreFiles = await glob('**/.gitignore', {
                cwd: this.rootDir,
                ignore: ['**/node_modules/**'],
                dot: true
            })

            for (const file of gitignoreFiles) {
                await this.loadGitIgnore(path.join(this.rootDir, path.dirname(file)))
            }

            // Add custom ignores
            if (this.customIgnores.length > 0) {
                this.ignoreInstance.add(this.customIgnores)
            }

            return true
        } catch (error) {
            console.warn(`Warning: Error initializing GitIgnoreHandler: ${error.message}`)
            return false
        }
    }

    /**
     * Load a specific .gitignore file
     */
    async loadGitIgnore(dirPath) {
        try {
            const gitignorePath = path.join(dirPath, '.gitignore')
            const content = await fs.readFile(gitignorePath, 'utf8')
            this.ignoreInstance.add(content)

            // Cache the rules for this directory
            this.cached.set(
                dirPath,
                content.split('\n').filter((line) => line.trim() && !line.startsWith('#'))
            )
        } catch (error) {
            // Silently ignore if .gitignore doesn't exist
            if (error.code !== 'ENOENT') {
                console.warn(`Warning: Error loading .gitignore at ${dirPath}: ${error.message}`)
            }
        }
    }

    /**
     * Check if a path should be ignored
     */
    shouldIgnore(filePath) {
        if (!this.enabled) return false

        const relativePath = path.relative(this.rootDir, filePath)
        return this.ignoreInstance.ignores(relativePath)
    }

    /**
     * Filter an array of paths based on gitignore rules
     */
    filterPaths(paths) {
        if (!this.enabled) return paths

        return paths.filter((filePath) => !this.shouldIgnore(filePath))
    }

    /**
     * Get all applicable ignore rules for a specific path
     */
    getRulesForPath(filePath) {
        const rules = new Set()
        let currentDir = path.dirname(filePath)

        while (currentDir.startsWith(this.rootDir)) {
            const dirRules = this.cached.get(currentDir)
            if (dirRules) {
                dirRules.forEach((rule) => rules.add(rule))
            }
            currentDir = path.dirname(currentDir)
        }

        return Array.from(rules)
    }

    /**
     * Add custom ignore patterns
     */
    addCustomIgnores(patterns) {
        this.customIgnores.push(...patterns)
        this.ignoreInstance.add(patterns)
    }
}

