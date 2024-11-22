# Enhanced Auto-Commit Configuration

## Configuration Schema

Add to your `repofm.config.json`:

```json
{
  "autoCommit": {
    "ui": {
      "showTimeline": true,
      "showDiff": true,
      "colorOutput": true,
      "icons": true,
      "useEmoji": true
    },
    "commit": {
      "separateByDefault": true,
      "pushByDefault": true,
      "requireConfirmation": true,
      "breakingChangePrompt": true,
      "conventionalCommits": true
    },
    "analysis": {
      "checkBreakingChanges": true,
      "suggestScope": true,
      "detectFileTypes": true,
      "scanForKeywords": true,
      "maxDiffLines": 500
    },
    "templates": {
      "feature": {
        "add": "feat({}): add {} functionality",
        "update": "feat({}): update {} implementation",
        // ... other templates
      },
      // ... other template categories
    },
    "fileTypes": {
      "react": {
        "pattern": "\\.jsx?$",
        "folders": ["components", "pages"],
        "keywords": ["React", "useState"]
      },
      // ... other file types
    },
    "customPatterns": {
      "jira": "([A-Z]+-\\d+)",
      "version": "(v\\d+\\.\\d+\\.\\d+)"
    }
  }
}
```

## Usage Examples

### 1. Basic Auto-Commit with Timeline

```bash
repofm auto-commit --timeline

# Output:
# 📦 Changes Summary
# ─────────────────────
# ✨ Added    src/components/Button.jsx
# 📝 Modified src/styles/main.css
# ...
```

### 2. Interactive Commit with File Selection

```bash
repofm auto-commit --interactive

# Shows:
# 🔍 Select Files to Commit
# □ src/components/Button.jsx
# □ src/styles/main.css
# ...
```

### 3. Smart Commit Message Generation

```bash
repofm auto-commit --smart-messages

# Analyzes files and suggests:
# feat(ui): implement responsive Button component
# style: update main stylesheet with new theme colors
```

## Feature Details

### Enhanced File Type Detection

The system now recognizes:

- Framework-specific files (React, Vue, Angular)
- Build configurations (webpack, vite, etc.)
- Test files (unit, e2e, integration)
- Documentation (markdown, JSDoc, TypeDoc)
- Style files (CSS, SCSS, Less)
- Configuration files (JSON, YAML)
- API definitions (OpenAPI, GraphQL)

### Interactive Features

1. **Visual File Selection**
   - Checkbox-based file selection
   - File grouping by type
   - Change preview
   - Diff visualization

2. **Smart Message Generation**
   - Template-based suggestions
   - Scope detection
   - Breaking change detection
   - Conventional commit format

3. **Timeline View**
   - Chronological change display
   - File type indicators
   - Change summary
   - Related files grouping

### Commit Templates

Templates are available for various types:

1. **Features**

```
feat(scope): add new feature
feat(scope): implement functionality
feat(scope): enhance capabilities
```

2. **Bug Fixes**

```
fix(scope): resolve issue
fix(scope): address bug
fix(scope): patch vulnerability
```

3. **Documentation**

```
docs(scope): add documentation
docs(scope): update examples
docs(api): revise API docs
```

4. **Styling**

```
style(scope): update styles
style(ui): enhance layout
style(theme): revise colors
```

### Best Practices

1. **Commit Organization**

```bash
   # Group related changes
   repofm auto-commit --group-by type

   # Separate different types
   repofm auto-commit --separate
   ```

2. **Message Quality**

   ```bash
   # Use conventional commits
   repofm auto-commit --conventional

   # Include scope
   repofm auto-commit --scope ui
   ```

3. **Review Process**

```bash
   # Show diff before commit
   repofm auto-commit --preview

   # Review timeline
   repofm auto-commit --timeline
   ```
