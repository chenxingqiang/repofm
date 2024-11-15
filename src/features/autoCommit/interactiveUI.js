// src/features/autoCommit/interactiveUI.js
import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import { createFuzzySearch } from 'fuzzy-search'
import { Table } from 'console-table-printer'
import chalk from 'chalk'
import terminalLink from 'terminal-link'
import figures from 'figures'
import PressToContinuePrompt from 'inquirer-press-to-continue'
import { marked } from 'marked'
import TerminalRenderer from 'marked-terminal'

export class InteractiveUI {
    constructor(config = {}) {
        this.config = {
            useEmoji: config.useEmoji ?? true,
            showHints: config.showHints ?? true,
            detailedDiff: config.detailedDiff ?? true,
            ...config
        }

        // Register custom prompts
        inquirer.registerPrompt('autocomplete', inquirerPrompt)
        inquirer.registerPrompt('press-to-continue', PressToContinuePrompt)
        marked.setOptions({
            renderer: new TerminalRenderer()
        })
    }

    /**
     * Show interactive file selection with diff preview
     */
    async selectFiles(files) {
        const fileChoices = await Promise.all(
            files.map(async (file) => {
                const stats = await this.getFileStats(file)
                return {
                    name: `${this.getFileIcon(file)} ${file} ${this.getChangeStats(stats)}`,
                    value: file,
                    short: file
                }
            })
        )

        const { selectedFiles } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to commit:',
                choices: fileChoices,
                pageSize: 15,
                loop: false,
                async filter(input) {
                    return input
                },
                validate(input) {
                    if (input.length === 0) {
                        return 'You must select at least one file'
                    }
                    return true
                }
            }
        ])

        return selectedFiles
    }

    /**
     * Interactive commit message builder
     */
    async buildCommitMessage(type, scope, suggestedMessage) {
        const questions = [
            {
                type: 'list',
                name: 'type',
                message: 'Select the type of change:',
                default: type,
                choices: [
                    { name: '✨ Features (feat)', value: 'feat' },
                    { name: '🐛 Bug Fixes (fix)', value: 'fix' },
                    { name: '📚 Documentation (docs)', value: 'docs' },
                    { name: '💄 Styles (style)', value: 'style' },
                    { name: '♻️ Code Refactoring (refactor)', value: 'refactor' },
                    { name: '⚡️ Performance (perf)', value: 'perf' },
                    { name: '✅ Tests (test)', value: 'test' },
                    { name: '🔧 Chores (chore)', value: 'chore' }
                ]
            },
            {
                type: 'autocomplete',
                name: 'scope',
                message: 'Enter the scope (optional):',
                default: scope,
                source: (answers, input = '') => {
                    const scopes = [
                        'api',
                        'ui',
                        'core',
                        'deps',
                        'config',
                        'test',
                        'build',
                        'ci',
                        'docs',
                        'style',
                        'perf'
                    ]
                    return scopes.filter((s) => s.toLowerCase().includes(input.toLowerCase()))
                }
            },
            {
                type: 'editor',
                name: 'description',
                message: 'Enter a detailed description:',
                default: suggestedMessage,
                validate(text) {
                    if (text.split('\n')[0].length <= 3) {
                        return 'Description must be more meaningful'
                    }
                    return true
                }
            },
            {
                type: 'confirm',
                name: 'isBreaking',
                message: 'Does this change include breaking changes?',
                default: false
            },
            {
                type: 'editor',
                name: 'breakingChanges',
                message: 'Describe the breaking changes:',
                when: (answers) => answers.isBreaking,
                validate(text) {
                    if (text.length < 10) {
                        return 'Breaking change description must be meaningful'
                    }
                    return true
                }
            }
        ]

        const answers = await inquirer.prompt(questions)
        return this.formatCommitMessage(answers)
    }

    /**
     * Show interactive diff viewer
     */
    async showDiffViewer(diff, filepath) {
        console.log(chalk.bold(`\nChanges in ${filepath}:`))

        const lines = diff.split('\n')
        const chunks = this.groupDiffChunks(lines)
        let currentChunk = 0

        while (currentChunk < chunks.length) {
            this.displayDiffChunk(chunks[currentChunk])

            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Diff navigation:',
                    choices: [
                        { name: 'Next chunk', value: 'next', disabled: currentChunk === chunks.length - 1 },
                        { name: 'Previous chunk', value: 'prev', disabled: currentChunk === 0 },
                        { name: 'Show context', value: 'context' },
                        { name: 'Done', value: 'done' }
                    ]
                }
            ])

            if (action === 'next') currentChunk++
            if (action === 'prev') currentChunk--
            if (action === 'done') break
            if (action === 'context') {
                await this.showFileContext(filepath)
            }
        }
    }

    /**
     * Interactive staging interface
     */
    async stageChanges(files) {
        const hunks = await this.getChangeHunks(files)
        const stagedHunks = new Set()

        for (const hunk of hunks) {
            this.displayHunk(hunk)

            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do with this change?',
                    choices: [
                        { name: 'Stage this hunk', value: 'stage' },
                        { name: 'Skip this hunk', value: 'skip' },
                        { name: 'Split this hunk', value: 'split' },
                        { name: 'Edit this hunk', value: 'edit' },
                        { name: 'View more context', value: 'context' }
                    ]
                }
            ])

            if (action === 'stage') {
                stagedHunks.add(hunk.id)
            } else if (action === 'split') {
                const splitHunks = await this.splitHunk(hunk)
                hunks.splice(hunks.indexOf(hunk), 1, ...splitHunks)
            } else if (action === 'edit') {
                const editedHunk = await this.editHunk(hunk)
                stagedHunks.add(editedHunk.id)
            }
        }

        return Array.from(stagedHunks)
    }

    /**
     * Show commit preview and get confirmation
     */
    async showCommitPreview(message, files) {
        console.log(chalk.bold('\nCommit Preview:'))
        console.log('─'.repeat(50))

        console.log(chalk.yellow('Message:'))
        console.log(message)

        console.log(chalk.yellow('\nFiles to be committed:'))
        const table = new Table({
            columns: [
                { name: 'file', title: 'File', alignment: 'left' },
                { name: 'changes', title: 'Changes', alignment: 'right' }
            ]
        })

        for (const file of files) {
            const stats = await this.getFileStats(file)
            table.addRow({
                file: this.getFileIcon(file) + ' ' + file,
                changes: this.getChangeStats(stats)
            })
        }

        table.printTable()

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to proceed with this commit?',
                default: true
            }
        ])

        return confirm
    }

    /**
     * Helper methods
     */
    getFileIcon(filepath) {
        const icons = {
            js: '📄',
            ts: '📘',
            jsx: '⚛️',
            css: '🎨',
            scss: '🎨',
            html: '🌐',
            md: '📝',
            json: '📋',
            yml: '⚙️',
            test: '✅'
        }

        const ext = filepath.split('.').pop()
        return icons[ext] || '📄'
    }

    getChangeStats(stats) {
        return chalk.green(`+${stats.additions}`) + ' ' + chalk.red(`-${stats.deletions}`)
    }

    async getFileStats(filepath) {
        // Implementation to get file stats
        return { additions: 0, deletions: 0 }
    }

    groupDiffChunks(lines, chunkSize = 5) {
        // Implementation to group diff lines into chunks
        return []
    }

    displayDiffChunk(chunk) {
        // Implementation to display a diff chunk
    }

    async showFileContext(filepath) {
        // Implementation to show file context
    }

    async getChangeHunks(files) {
        // Implementation to get change hunks
        return []
    }

    displayHunk(hunk) {
        // Implementation to display a hunk
    }

    async splitHunk(hunk) {
        // Implementation to split a hunk
        return []
    }

    async editHunk(hunk) {
        // Implementation to edit a hunk
        return hunk
    }

    formatCommitMessage(answers) {
        let message = `${answers.type}`
        if (answers.scope) {
            message += `(${answers.scope})`
        }
        message += `: ${answers.description.split('\n')[0]}`

        if (answers.description.split('\n').length > 1) {
            message += `\n\n${answers.description.split('\n').slice(1).join('\n')}`
        }

        if (answers.isBreaking) {
            message += `\n\nBREAKING CHANGE: ${answers.breakingChanges}`
        }

        return message
    }
}
