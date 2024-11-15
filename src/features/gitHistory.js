// src/features/gitHistory.js
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'

export class GitHistoryTracker {
    constructor(config) {
        this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
    }

    async trackCommand(command, repoPath) {
        const repoName = this.getRepoName(repoPath)
        const commandType = this.parseCommandType(command)

        await this.supabase.from('git_command_history').insert({
            command_type: commandType,
            repository_path: repoPath,
            repository_name: repoName,
            command_details: {
                full_command: command,
                timestamp: new Date().toISOString()
            }
        })

        await this.updateRepositoryMetadata(repoPath, commandType)
    }

    async getDashboardData(timeRange = '7d') {
        const { data, error } = await this.supabase
            .from('git_command_history')
            .select(
                `
        command_type,
        repository_name,
        command_details,
        executed_at
      `
            )
            .gte('executed_at', new Date(Date.now() - this.parseTimeRange(timeRange)))
            .order('executed_at', { ascending: false })

        if (error) throw error
        return this.formatDashboardData(data)
    }
}
