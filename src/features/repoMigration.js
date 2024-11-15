// src/features/repoMigration.js
import { Octokit } from '@octokit/rest'
import simpleGit from 'simple-git'

export class RepoMigrationService {
    constructor(config) {
        this.octokit = new Octokit({ auth: config.githubToken })
        this.git = simpleGit()
    }

    async searchUserRepos(username) {
        try {
            const { data } = await this.octokit.repos.listForUser({
                username,
                sort: 'updated',
                per_page: 100
            })
            return data.map((repo) => ({
                name: repo.name,
                description: repo.description,
                url: repo.clone_url,
                stars: repo.stargazers_count,
                language: repo.language
            }))
        } catch (error) {
            throw new Error(`Failed to fetch repositories: ${error.message}`)
        }
    }

    async migrateRepository({ sourceRepo, targetName, targetOwner, cloneLocally, localPath }) {
        try {
            // Clone repository
            await this.git.clone(sourceRepo.url, localPath)

            if (cloneLocally) {
                // If user wants to keep local copy, we're done
                return { success: true, path: localPath }
            }

            // Create new repository
            const { data: newRepo } = await this.octokit.repos.createForAuthenticatedUser({
                name: targetName,
                private: true
            })

            // Push to new repository
            await this.git.cwd(localPath).removeRemote('origin').addRemote('origin', newRepo.clone_url).push(['--all'])

            return {
                success: true,
                newRepoUrl: newRepo.html_url,
                localPath: cloneLocally ? localPath : null
            }
        } catch (error) {
            throw new Error(`Migration failed: ${error.message}`)
        }
    }
}
