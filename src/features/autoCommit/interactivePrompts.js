// src/features/autoCommit/interactivePrompts.js
import inquirer from 'inquirer'
import { AutoComplete } from 'enquirer'

export class InteractivePrompts {
    constructor() {
        this.templates = commitTemplates
        this.fileTypes = fileTypePatterns
    }

    async getScopeAndType(analysis) {
        const { type } = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'Select commit type:',
                choices: [
                    { name: '✨ Feature (feat)', value: 'feat' },
                    { name: '🐛 Bug Fix (fix)', value: 'fix' },
                    { name: '📚 Documentation (docs)', value: 'docs' },
                    { name: '💅 Styling (style)', value: 'style' },
                    { name: '♻️ Refactor (refactor)', value: 'refactor' },
                    { name: '✅ Testing (test)', value: 'test' },
                    { name: '🔨 Build (build)', value: 'build' },
                    { name: '🔧 Chore (chore)', value: 'chore' }
                ],
                default: analysis?.type || 'feat'
            }
        ])

        const { scope } = await inquirer.prompt([
            {
                type: 'input',
                name: 'scope',
                message: 'Enter commit scope (optional):',
                default: analysis?.scope || ''
            }
        ])

        return { type, scope }
    }

    async getCommitTemplate(type, scope) {
        const templates = this.templates[type] || this.templates.feature
        const choices = Object.values(templates).map((template) => template.replace('{}', scope || 'component'))

        const prompt = new AutoComplete({
            name: 'template',
            message: 'Select or customize commit message:',
            choices,
            suggest(input, choices) {
                return choices.filter((choice) => choice.toLowerCase().includes(input.toLowerCase()))
            }
        })

        return prompt.run()
    }

    async getCommitDetails(files) {
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to commit:',
                choices: files.map((file) => ({
                    name: file,
                    checked: true
                }))
            },
            {
                type: 'confirm',
                name: 'separateCommits',
                message: 'Commit files separately?',
                default: files.length > 1
            },
            {
                type: 'confirm',
                name: 'pushChanges',
                message: 'Push changes after commit?',
                default: true
            }
        ])

        return answers
    }

    async getBreakingChangeInfo() {
        return inquirer.prompt([
            {
                type: 'confirm',
                name: 'isBreaking',
                message: 'Does this commit include breaking changes?',
                default: false
            },
            {
                type: 'input',
                name: 'breakingChangeDescription',
                message: 'Describe the breaking changes:',
                when: (answers) => answers.isBreaking
            }
        ])
    }
}
