# Release Notes v0.2.0

This major release introduces three powerful new features to repofm: GitHub repository migration, Git command history tracking, and enhanced code context management. These additions significantly expand repofm's capabilities in managing and analyzing code repositories.

## What's New

### GitHub Repository Migration (#100)

- Added functionality to search and migrate repositories from specific GitHub users:
  - Search repositories by username
  - Clone repositories with custom naming
  - Optional local cloning
  - Automated repository creation and migration
  - Flexible target account selection

### Git Command History Tracking (#101)

- Implemented comprehensive Git command tracking:
  - Tracks clone, commit, and push operations
  - Project-based command grouping
  - Local Supabase integration for data persistence
  - Interactive dashboard for activity visualization
  - Date-based filtering and organization

### Enhanced Code Context Management (#102)

- Added dynamic code context management:
  - Support for function-level context queries
  - File-level context extraction
  - Character-level precision
  - Multiple output formats (plain, markdown, XML)
  - Context depth configuration

## How to Use

### Repository Migration

```bash
repofm migrate-repo -u sourceUser -n newName -o targetOrg --clone
```

### Git History Dashboard

```bash
repofm git-dashboard --range 7d
```

### Context Management

```bash
repofm context -t "functionName" -y function -d 2 -f markdown
```

## Configuration

Update your `repofm.config.json` with the new settings:

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
    "maxDepth": 2
  }
}
```

## How to Update

To update to the latest version, run:

```bash
npm update -g repofm
```

---

As always, we appreciate your feedback and contributions to make repofm even better! If you encounter any issues or have suggestions regarding these new features, please let us know through our GitHub issues.
