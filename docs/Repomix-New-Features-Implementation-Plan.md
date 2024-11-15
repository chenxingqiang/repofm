# repofm Feature Implementation Plan

## 1. GitHub Repository Migration Feature

### Overview

Add functionality to search and clone repositories from a specific GitHub user, then optionally clone locally and push to a specified account with a new name.

### Implementation Details

```javascript
// src/features/repoMigration.js
import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';

export class RepoMigrationService {
  constructor(config) {
    this.octokit = new Octokit({ auth: config.githubToken });
    this.git = simpleGit();
  }

  async searchUserRepos(username) {
    try {
      const { data } = await this.octokit.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100
      });
      return data.map(repo => ({
        name: repo.name,
        description: repo.description,
        url: repo.clone_url,
        stars: repo.stargazers_count,
        language: repo.language
      }));
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  async migrateRepository({
    sourceRepo,
    targetName,
    targetOwner,
    cloneLocally,
    localPath
  }) {
    try {
      // Clone repository
      await this.git.clone(sourceRepo.url, localPath);

      if (cloneLocally) {
        // If user wants to keep local copy, we're done
        return { success: true, path: localPath };
      }

      // Create new repository
      const { data: newRepo } = await this.octokit.repos.createForAuthenticatedUser({
        name: targetName,
        private: true
      });

      // Push to new repository
      await this.git.cwd(localPath)
        .removeRemote('origin')
        .addRemote('origin', newRepo.clone_url)
        .push(['--all']);

      return {
        success: true,
        newRepoUrl: newRepo.html_url,
        localPath: cloneLocally ? localPath : null
      };
    } catch (error) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  }
}
```

## 2. Git Command History Tracking

### Overview

Track global Git command history, focusing on clone, commit, and push operations. Store data in Supabase and provide a dashboard view.

### Database Schema (Supabase)

```sql
-- Git command history table
CREATE TABLE git_command_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  command_type TEXT NOT NULL,
  repository_path TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  command_details JSONB NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL
);

-- Repository metadata table
CREATE TABLE repository_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  repository_path TEXT UNIQUE NOT NULL,
  repository_name TEXT NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_commits INTEGER DEFAULT 0,
  total_pushes INTEGER DEFAULT 0
);
```

### Implementation

```javascript
// src/features/gitHistory.js
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

export class GitHistoryTracker {
  constructor(config) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async trackCommand(command, repoPath) {
    const repoName = this.getRepoName(repoPath);
    const commandType = this.parseCommandType(command);

    await this.supabase
      .from('git_command_history')
      .insert({
        command_type: commandType,
        repository_path: repoPath,
        repository_name: repoName,
        command_details: {
          full_command: command,
          timestamp: new Date().toISOString()
        }
      });

    await this.updateRepositoryMetadata(repoPath, commandType);
  }

  async getDashboardData(timeRange = '7d') {
    const { data, error } = await this.supabase
      .from('git_command_history')
      .select(`
        command_type,
        repository_name,
        command_details,
        executed_at
      `)
      .gte('executed_at', new Date(Date.now() - this.parseTimeRange(timeRange)))
      .order('executed_at', { ascending: false });

    if (error) throw error;
    return this.formatDashboardData(data);
  }
}
```

## 3. Code Context Management

### Overview

Implement dynamic management of code context information with support for function, file, and character-level queries. Output in plain, markdown, or XML format.

### Implementation

```javascript
// src/features/contextManager.js
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as fs from 'fs/promises';

export class CodeContextManager {
  constructor(config) {
    this.outputFormat = config.outputFormat || 'markdown';
  }

  async getContext({
    target,
    type,
    depth = 1,
    includeImports = true
  }) {
    const context = await this.extractContext(target, type, depth);
    return this.formatOutput(context);
  }

  async extractContext(target, type, depth) {
    switch (type) {
      case 'function':
        return this.getFunctionContext(target, depth);
      case 'file':
        return this.getFileContext(target, depth);
      case 'character':
        return this.getCharacterContext(target, depth);
      default:
        throw new Error(`Unsupported context type: ${type}`);
    }
  }

  formatOutput(context) {
    switch (this.outputFormat) {
      case 'markdown':
        return this.toMarkdown(context);
      case 'xml':
        return this.toXML(context);
      default:
        return this.toPlainText(context);
    }
  }
}
```

## Configuration Updates

Add the following to `repofm.config.json`:

```json
{
  "github": {
    "token": "YOUR_GITHUB_TOKEN"
  },
  "supabase": {
    "url": "YOUR_SUPABASE_URL",
    "key": "YOUR_SUPABASE_KEY"
  },
  "context": {
    "outputFormat": "markdown",
    "maxDepth": 2,
    "includeImports": true
  }
}
```

## CLI Commands

Add these new commands to the CLI:

```javascript
// src/cli.js
program
  .command('migrate-repo')
  .description('Search and migrate repositories from a GitHub user')
  .option('-u, --user <username>', 'Source GitHub username')
  .option('-n, --name <name>', 'New repository name')
  .option('-o, --owner <owner>', 'Target owner/organization')
  .option('-c, --clone', 'Clone repository locally')
  .action(async (options) => {
    const service = new RepoMigrationService(config);
    await service.migrateRepository(options);
  });

program
  .command('git-dashboard')
  .description('Show Git activity dashboard')
  .option('-r, --range <range>', 'Time range (e.g., 7d, 30d)', '7d')
  .action(async (options) => {
    const tracker = new GitHistoryTracker(config);
    const data = await tracker.getDashboardData(options.range);
    console.log(formatDashboard(data));
  });

program
  .command('context')
  .description('Get code context')
  .option('-t, --target <target>', 'Target (function name, file path, or character position)')
  .option('-y, --type <type>', 'Context type (function, file, character)')
  .option('-d, --depth <depth>', 'Context depth', '1')
  .option('-f, --format <format>', 'Output format (plain, markdown, xml)', 'markdown')
  .action(async (options) => {
    const manager = new CodeContextManager({ outputFormat: options.format });
    const context = await manager.getContext(options);
    console.log(context);
  });
```
