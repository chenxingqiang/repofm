// src/features/autoCommit/visualInterface.js
import chalk from 'chalk'
import boxen from 'boxen'
import ora from 'ora'
import { Table } from 'console-table-printer'

export class VisualInterface {
    constructor() {
        this.spinner = ora()
    }

    /**
     * Display file changes summary
     */
    displayChangesSummary(changes) {
        console.log(
            boxen(chalk.bold('📦 Changes Summary'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'blue'
            })
        )

        const table = new Table({
            columns: [
                { name: 'status', alignment: 'left', color: 'white' },
                { name: 'file', alignment: 'left', color: 'white' },
                { name: 'changes', alignment: 'right', color: 'white' },
                { name: 'type', alignment: 'left', color: 'white' }
            ]
        })

        changes.forEach((change) => {
            const status = this.getStatusIcon(change.status)
            table.addRow(
                {
                    status,
                    file: change.file,
                    changes: `+${change.additions} -${change.deletions}`,
                    type: this.getFileType(change.file)
                },
                { color: this.getStatusColor(change.status) }
            )
        })

        table.printTable()
    }

    /**
     * Show commit preview
     */
    displayCommitPreview(commitInfo) {
        console.log(
            boxen(chalk.bold('🔍 Commit Preview'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'yellow'
            })
        )

        console.log(chalk.blue('Type:    ') + chalk.white(commitInfo.type))
        console.log(chalk.blue('Scope:   ') + chalk.white(commitInfo.scope || 'none'))
        console.log(chalk.blue('Message: ') + chalk.white(commitInfo.message))

        if (commitInfo.breaking) {
            console.log(chalk.red('\nBREAKING CHANGE:'))
            console.log(chalk.red(commitInfo.breakingMessage))
        }

        console.log('\n')
    }

    /**
     * Display timeline visualization
     */
    displayTimeline(timelineData) {
        console.log(
            boxen(chalk.bold('⏰ Changes Timeline'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green'
            })
        )

        timelineData.forEach((item) => {
            const time = new Date(item.modTime).toLocaleTimeString()
            const icon = this.getFileTypeIcon(item.type)

            console.log(chalk.gray(time) + ' ' + icon + ' ' + chalk.white(item.file))

            if (item.summary) {
                console.log(chalk.gray('  ├─ ') + chalk.dim(item.summary))
            }

            if (item.suggestions) {
                console.log(chalk.gray('  └─ ') + chalk.blue(item.suggestions.join(', ')))
            }
        })
    }

    /**
     * Show file diff preview
     */
    displayDiffPreview(diff) {
        console.log(
            boxen(chalk.bold('📝 Diff Preview'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'magenta'
            })
        )

        diff.split('\n').forEach((line) => {
            if (line.startsWith('+')) {
                console.log(chalk.green(line))
            } else if (line.startsWith('-')) {
                console.log(chalk.red(line))
            } else {
                console.log(chalk.gray(line))
            }
        })
    }

    /**
     * Display operation progress
     */
    showProgress(message, type = 'info') {
        this.spinner.stop()

        switch (type) {
            case 'start':
                this.spinner.start(chalk.blue(message))
                break
            case 'success':
                this.spinner.succeed(chalk.green(message))
                break
            case 'error':
                this.spinner.fail(chalk.red(message))
                break
            case 'warning':
                this.spinner.warn(chalk.yellow(message))
                break
            default:
                this.spinner.info(chalk.blue(message))
        }
    }

    /**
     * Display commit results
     */
    displayResults(results) {
        console.log(
            boxen(chalk.bold('✨ Commit Results'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green'
            })
        )

        const table = new Table({
            columns: [
                { name: 'status', alignment: 'left', color: 'white' },
                { name: 'file', alignment: 'left', color: 'white' },
                { name: 'message', alignment: 'left', color: 'white' }
            ]
        })

        results.forEach((result) => {
            table.addRow(
                {
                    status: result.success ? '✅' : '❌',
                    file: result.file,
                    message: result.message || result.error
                },
                {
                    color: result.success ? 'green' : 'red'
                }
            )
        })

        table.printTable()

        if (results.some((r) => !r.success)) {
            console.log(chalk.yellow('\n⚠️  Some commits failed. Please check the results above.'))
        }
    }

    /**
     * Helper functions
     */
    getStatusIcon(status) {
        const icons = {
            added: '✨',
            modified: '📝',
            deleted: '🗑️',
            renamed: '📋',
            copied: '📑',
            untracked: '❓'
        }
        return icons[status] || '❓'
    }

    getStatusColor(status) {
        const colors = {
            added: 'green',
            modified: 'yellow',
            deleted: 'red',
            renamed: 'blue',
            copied: 'cyan',
            untracked: 'gray'
        }
        return colors[status] || 'white'
    }

    getFileTypeIcon(type) {
        const icons = {
            js: '🟨',
            ts: '🔷',
            jsx: '⚛️',
            css: '🎨',
            html: '🌐',
            md: '📝',
            json: '📋',
            yml: '⚙️',
            test: '✅',
            other: '📄'
        }
        return icons[type] || icons.other
    }

    getFileType(filePath) {
        const ext = filePath.split('.').pop().toLowerCase()
        const types = {
            js: 'JavaScript',
            ts: 'TypeScript',
            jsx: 'React',
            tsx: 'React/TS',
            css: 'Styles',
            scss: 'Styles',
            md: 'Docs',
            json: 'Config',
            yml: 'Config',
            yaml: 'Config',
            test: 'Test',
            spec: 'Test'
        }
        return types[ext] || 'Other'
    }
}
