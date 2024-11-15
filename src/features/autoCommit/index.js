// src/features/autoCommit/index.js
import simpleGit from 'simple-git'
import chalk from 'chalk'
import { promises as fs } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export class AutoCommitManager {
    constructor(config = {}) {
        this.git = simpleGit()
        this.config = {
            includePush: config.includePush ?? true,
            separateCommits: config.separateCommits ?? true,
            generateTimeline: config.generateTimeline ?? true,
            ...config
        }
        this.contentAnalyzer = new ContentAnalyzer()
        this.prompts = new InteractivePrompts()
        this.ui = new VisualInterface()
        this.messageGenerator = new CommitMessageGenerator(config.templates)
        this.ui = new InteractiveUI(config.ui)
    }

    async execute(options = {}) {
        try {
            const files = await this.getChangedFiles()

            // Interactive file selection
            const selectedFiles = await this.ui.selectFiles(files)

            // Show diff viewer for selected files
            for (const file of selectedFiles) {
                const diff = await this.getFileDiff(file)
                await this.ui.showDiffViewer(diff, file)
            }

            // Interactive staging
            const stagedHunks = await this.ui.stageChanges(selectedFiles)

            // Generate and customize commit message
            const { type, scope, message } = await this.generateCommitMessage(selectedFiles[0])
            const customMessage = await this.ui.buildCommitMessage(type, scope, message)

            // Show preview and get confirmation
            const confirmed = await this.ui.showCommitPreview(customMessage, selectedFiles)

            if (confirmed) {
                return this.performCommit(selectedFiles, customMessage, stagedHunks)
            }

            return { success: false, message: 'Commit cancelled by user' }
        } catch (error) {
            throw new Error(`Failed to execute commit: ${error.message}`)
        }
    }

    async generateCommitMessage(file, diff) {
        const analysis = await this.messageGenerator.analyzeChanges(file, diff)
        return this.messageGenerator.generateMessage(file, diff, analysis)
    }

    async execute(options = {}) {
        this.ui.showProgress('Analyzing repository...', 'start')

        try {
            const status = await this.git.status()

            if (!status.files.length) {
                this.ui.showProgress('No changes to commit', 'info')
                return { success: true, message: 'No changes' }
            }

            // Display changes summary
            const changes = await this.getChangesDetails(status.files)
            this.ui.displayChangesSummary(changes)

            // Show timeline if requested
            if (options.timeline) {
                const timeline = await this.generateTimelineSuggestions()
                this.ui.displayTimeline(timeline)
            }

            // Get commit details through interactive UI
            const commitDetails = await this.prompts.getCommitDetails(status.files)

            // Process commits
            const results = []
            for (const file of commitDetails.selectedFiles) {
                this.ui.showProgress(`Committing ${file}...`, 'start')

                // Get diff and show preview
                const diff = await this.getFileDiff(file)
                this.ui.displayDiffPreview(diff)

                // Generate and preview commit message
                const commitInfo = await this.generateCommitMessage(file, diff)
                this.ui.displayCommitPreview(commitInfo)

                // Perform commit
                const result = await this.commitFile(file, commitInfo)
                results.push(result)

                if (result.success) {
                    this.ui.showProgress(`Successfully committed ${file}`, 'success')
                } else {
                    this.ui.showProgress(`Failed to commit ${file}: ${result.error}`, 'error')
                }
            }

            // Push if requested
            if (commitDetails.pushChanges) {
                this.ui.showProgress('Pushing changes...', 'start')
                const pushResult = await this.pushChanges()

                if (pushResult.success) {
                    this.ui.showProgress('Successfully pushed changes', 'success')
                } else {
                    this.ui.showProgress(`Failed to push: ${pushResult.error}`, 'error')
                }
            }

            // Display final results
            this.ui.displayResults(results)

            return {
                success: true,
                commits: results,
                push: commitDetails.pushChanges ? pushResult : null
            }
        } catch (error) {
            this.ui.showProgress(`Operation failed: ${error.message}`, 'error')
            throw error
        }
    }

    async generateCommitMessage(file, content) {
        const analysis = await this.contentAnalyzer.analyzeContent(file, content)

        if (this.config.interactive) {
            const { type, scope } = await this.prompts.getScopeAndType(analysis)
            const template = await this.prompts.getCommitTemplate(type, scope)

            // Handle breaking changes
            const { isBreaking, breakingChangeDescription } = await this.prompts.getBreakingChangeInfo()

            return {
                message: template,
                isBreaking,
                breakingChangeDescription
            }
        }

        // Auto-generate message based on analysis
        const type = analysis.suggestions[0] || 'chore'
        const scope = analysis.scope || ''
        const template = commitTemplates[type].update

        return {
            message: template.replace('{}', scope).replace('{}', path.basename(file)),
            isBreaking: false
        }
    }

    /**
     * Get file modification time
     */
    async getFileModTime(filePath) {
        try {
            const stats = await fs.stat(filePath)
            return stats.mtime.getTime()
        } catch (error) {
            console.warn(`Warning: Could not get mod time for ${filePath}`)
            return 0
        }
    }

    /**
     * Generate timeline-based suggestions
     */
    async generateTimelineSuggestions() {
        const status = await this.git.status()
        const files = [...status.modified, ...status.not_added, ...status.created]

        const timelineData = await Promise.all(
            files.map(async (file) => ({
                file,
                modTime: await this.getFileModTime(file),
                type: path.extname(file).slice(1) || 'unknown'
            }))
        )

        // Sort by modification time
        return timelineData.sort((a, b) => a.modTime - b.modTime)
    }

    /**
     * Generate commit message based on file type and changes
     */
    generateCommitMessage(file, type, diff) {
        const commitTypes = {
            js: 'feat',
            ts: 'feat',
            jsx: 'feat',
            tsx: 'feat',
            css: 'style',
            scss: 'style',
            less: 'style',
            md: 'docs',
            json: 'chore',
            yml: 'chore',
            yaml: 'chore',
            test: 'test',
            spec: 'test'
        }

        // Determine commit type
        const fileType = path.extname(file).slice(1)
        const commitType = commitTypes[fileType] || 'chore'

        // Check for specific keywords in diff
        const isTest = file.includes('test') || file.includes('spec')
        const isFix = diff.includes('fix') || diff.includes('bug')
        const isRefactor = diff.includes('refactor')

        if (isTest) return `test: update tests in ${file}`
        if (isFix) return `fix: resolve issue in ${file}`
        if (isRefactor) return `refactor: improve code in ${file}`

        return `${commitType}: update ${file}`
    }

    /**
     * Get file differences
     */
    async getFileDiff(file) {
        try {
            const diff = await this.git.diff([file])
            return diff
        } catch (error) {
            return ''
        }
    }

    /**
     * Process single file commit
     */
    async commitFile(file) {
        try {
            const diff = await this.getFileDiff(file)
            const commitMessage = this.generateCommitMessage(file, path.extname(file), diff)

            await this.git.add(file)
            await this.git.commit(commitMessage)

            return {
                success: true,
                message: commitMessage,
                file
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                file
            }
        }
    }

    /**
     * Process bulk commit
     */
    async commitAll(files, message) {
        try {
            await this.git.add(files)

            const defaultMessage =
                files.length === 1 ? `update: ${files[0]}` : `update: multiple files (${files.length} files)`

            await this.git.commit(message || defaultMessage)

            return {
                success: true,
                message: message || defaultMessage,
                files
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                files
            }
        }
    }

    /**
     * Push changes to remote
     */
    async pushChanges() {
        const currentBranch = await this.git.revparse(['--abbrev-ref', 'HEAD'])

        // Pull first to avoid conflicts
        await this.git.pull('origin', currentBranch, { '--rebase': 'false' })

        // Push changes
        await this.git.push('origin', currentBranch)

        return {
            success: true,
            branch: currentBranch
        }
    }

    /**
     * Main execution method
     */
    async execute(options = {}) {
        const status = await this.git.status()

        // Check if there are changes
        if (!status.files.length) {
            return {
                success: true,
                message: 'No changes to commit'
            }
        }

        const results = {
            commits: [],
            push: null
        }

        try {
            if (options.separateCommits || this.config.separateCommits) {
                // Commit files separately
                for (const file of status.files) {
                    const result = await this.commitFile(file.path)
                    results.commits.push(result)
                }
            } else {
                // Commit all changes together
                const files = status.files.map((f) => f.path)
                const result = await this.commitAll(files, options.message)
                results.commits.push(result)
            }

            // Push if configured
            if (options.push || this.config.includePush) {
                results.push = await this.pushChanges()
            }

            return results
        } catch (error) {
            throw new Error(`Auto-commit failed: ${error.message}`)
        }
    }
}

// src/cli/commands/autoCommit.js
import { Command } from 'commander'
import inquirer from 'inquirer'
import { AutoCommitManager } from '../../features/autoCommit'

export function registerAutoCommitCommand(program) {
    const autoCommitCommand = new Command('auto-commit')
        .description('Automatically commit changes with smart messages')
        .option('-s, --separate', 'Commit files separately')
        .option('-p, --push', 'Push changes after commit')
        .option('-m, --message <message>', 'Custom commit message for bulk commit')
        .option('-t, --timeline', 'Show timeline of changes')
        .option('-y, --yes', 'Skip confirmation prompts')
        .action(async (options) => {
            try {
                const config = await loadConfig()
                const manager = new AutoCommitManager(config.autoCommit)

                if (options.timeline) {
                    const timeline = await manager.generateTimelineSuggestions()
                    console.log(chalk.blue('\nTimeline of changes:'))
                    timeline.forEach(({ file, modTime }) => {
                        console.log(chalk.yellow(`[${new Date(modTime).toLocaleString()}] ${file}`))
                    })
                }

                if (!options.yes) {
                    const { confirm } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'confirm',
                            message: 'Do you want to proceed with the commit?',
                            default: true
                        }
                    ])

                    if (!confirm) {
                        console.log(chalk.yellow('Operation cancelled'))
                        return
                    }
                }

                const results = await manager.execute({
                    separateCommits: options.separate,
                    push: options.push,
                    message: options.message
                })

                // Display results
                console.log(chalk.green('\nCommit Results:'))
                results.commits.forEach((commit) => {
                    if (commit.success) {
                        console.log(chalk.green(`✓ ${commit.message}`))
                    } else {
                        console.log(chalk.red(`✗ Failed to commit ${commit.file}: ${commit.error}`))
                    }
                })

                if (results.push) {
                    console.log(chalk.green(`\n✓ Changes pushed to ${results.push.branch}`))
                }
            } catch (error) {
                console.error(chalk.red(`Error: ${error.message}`))
                process.exit(1)
            }
        })

    return autoCommitCommand
}
