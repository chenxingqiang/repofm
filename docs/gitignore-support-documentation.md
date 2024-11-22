# GitIgnore Support Documentation

## Overview

The GitIgnore support feature allows you to automatically respect `.gitignore` rules across all context operations. This feature can be configured globally and overridden per command.

## Configuration

Add these settings to your `repofm.config.json`:

```json
{
  "context": {
    "respectGitIgnore": true,
    "customIgnores": [
      "*.log",
      "temp/",
      "private/"
    ]
  }
}
```

## Usage

### Command Line Options

```bash
# Disable gitignore support for a specific command
repofm context extract --target "src/" --type file --respect-gitignore false

# Add custom ignore patterns
repofm context extract --target "src/" --type file --custom-ignore "*.log" "temp/*"

# Show which files are being ignored
repofm context extract --target "src/" --type file --show-ignored
```

### Global Configuration

You can set up global ignore patterns that will be combined with your `.gitignore` rules:

```json
{
  "context": {
    "respectGitIgnore": true,
    "customIgnores": [
      "*.log",
      "*.tmp",
      "node_modules/",
      "build/",
      "dist/",
      ".env*",
      "coverage/",
      "*.test.js"
    ]
  }
}
```

## Features

1. **Automatic .gitignore Detection**
   - Automatically loads all `.gitignore` files in the project
   - Supports nested `.gitignore` files
   - Respects global git ignore rules

2. **Custom Ignore Patterns**
   - Add custom patterns via configuration
   - Override patterns via command line
   - Support for glob patterns

3. **Performance Optimization**
   - Caches ignore rules for better performance
   - Minimal overhead on context operations
   - Efficient path filtering

## Examples

### 1. Basic Usage

```bash
# Extract context while respecting .gitignore
repofm context extract --target src/components --type file

# The command will automatically ignore files that match .gitignore patterns
```

### 2. Custom Ignore Patterns

```bash
# Add temporary ignore patterns
repofm context extract --target src/ --type file \
  --custom-ignore "*.spec.js" "*.test.js" "**/__tests__/*"
```

### 3. Showing Ignored Files

```bash
# Show which files are being ignored
repofm context extract --target src/ --type file --show-ignored

# Output will include:
# Ignored: src/components/__tests__/
# Ignored: src/components/*.test.js
# ...
```

### 4. Ignoring in Specific Directories

Create a `.gitignore` file in any directory:

```plaintext
# src/components/.gitignore
__tests__/
*.test.js
*.spec.js
```

The context manager will automatically respect these rules when processing files in that directory.

## Best Practices

1. **Project Organization**
   - Place `.gitignore` files strategically in subdirectories
   - Use custom ignore patterns for temporary exclusions
   - Document project-specific ignore patterns

2. **Performance**
   - Use specific paths when possible to limit scope
   - Consider disabling gitignore support for quick operations
   - Cache ignore rules when working with large codebases

3. **Maintenance**
   - Regularly review and update ignore patterns
   - Document custom ignore patterns in project documentation
   - Use consistent patterns across team members

## Common Use Cases

1. **Excluding Test Files**

```json
{
  "context": {
    "customIgnores": [
      "**/*.test.js",
      "**/*.spec.js",
      "**/__tests__/*",
      "**/test/*"
    ]
  }
}
```

2. **Excluding Build Artifacts**

```json
{
  "context": {
    "customIgnores": [
      "dist/",
      "build/",
      ".next/",
      "out/",
      ".cache/"
    ]
  }
}
```

3. **Excluding Development Files**

```json
{
  "context": {
    "customIgnores": [
      ".env*",
      "*.log",
      "*.tmp",
      ".vscode/",
      ".idea/"
    ]
  }
}
```
