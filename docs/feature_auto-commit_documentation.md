# Auto Commit Feature Documentation

## Overview

The Auto Commit feature provides intelligent, automated git commit management with smart message generation and timeline-based suggestions.

## Configuration

Add to your `repofm.config.json`:

```json
{
  "autoCommit": {
    "includePush": true,
    "separateCommits": true,
    "generateTimeline": true,
    "commitTypes": {
      "js": "feat",
      "ts": "feat",
      "css": "style",
      "md": "docs",
      "test.js": "test"
    },
    "defaultType": "chore"
  }
}
```

## Command Line Usage

### Basic Usage

```bash
# Simple auto-commit
repofm auto-commit

# Commit and push
repofm auto-commit --push

# Commit files separately
repofm auto-commit --separate

# Show timeline before committing
repofm auto-commit --timeline

# Skip confirmation prompts
repofm auto-commit --yes

# Provide custom message for bulk commit
repofm auto-commit --message "feat: implement new feature"
```

### Options

- `-s, --separate`: Commit files separately
- `-p, --push`: Push changes after commit
- `-m, --message <message>`: Custom commit message
- `-t, --timeline`: Show timeline of changes
- `-y, --yes`: Skip confirmation prompts

## Features

### 1. Timeline-Based Analysis

```bash
repofm auto-commit --timeline

# Output:
Timeline of changes:
[2024-11-14 10:30:15] src/components/Button.js
[2024-11-14 10:35:22] src/styles/main.css
[2024-11-14 10:40:18] docs/README.md
```

### 2. Smart Commit Messages

The feature automatically generates appropriate commit messages based on:

- File type
- Changes content
- File location
- Commit conventions

Examples:

```
feat: update Button component implementation
style: refine main stylesheet
docs: update README documentation
test: add unit tests for auth module
fix: resolve navigation issue
```

### 3. Interactive Mode

Without the `--yes` flag, the tool provides interactive prompts:

```bash
repofm auto-commit

? Do you want to proceed with the commit? (Y/n)
? Commit files separately? (Y/n)
? Push changes after commit? (Y/n)
```

### 4. Batch Processing

```bash
# Commit all changes with a single message
repofm auto-commit -m "feat: implement user authentication"

# Commit files separately with smart messages
repofm auto-commit --separate
```

## Best Practices

1. **Review Timeline First**

```bash
   # Check changes timeline before committing
   repofm auto-commit --timeline
   ```

2. **Separate Commits for Different Types**

   ```bash
   # Use separate commits for better organization
   repofm auto-commit --separate
   ```

3. **Custom Messages for Major Changes**

```bash
   # Provide explicit message for significant changes
   repofm auto-commit -m "feat(auth): implement OAuth2 login"
   ```

## Common Patterns

### 1. Quick Updates

```bash
# Quick commit and push
repofm auto-commit -y -p
```

### 2. Detailed Review

```bash
# Review changes and commit separately
repofm auto-commit -t -s
```

### 3. Batch Changes

```bash
# Commit related changes together
repofm auto-commit -m "refactor: update component architecture"
```

## Tips

1. **Commit Message Conventions**
   - The tool follows conventional commit standards
   - Messages are structured as `type(scope): description`
   - Types include: feat, fix, docs, style, refactor, test, chore

2. **File Organization**
   - Group related changes for better commit organization
   - Use separate commits for different types of changes
   - Consider the timeline when organizing commits

3. **Push Strategy**
   - The tool automatically pulls before pushing
   - Use `--push` for immediate remote updates
   - Consider CI/CD triggers when pushing

4. **Timeline Analysis**
   - Use timeline view to understand change patterns
   - Group changes by time periods
   - Identify related modifications
