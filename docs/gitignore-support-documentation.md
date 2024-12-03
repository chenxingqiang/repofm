# GitIgnore Support Documentation

## Overview

The GitIgnore support feature allows you to automatically respect `.gitignore` rules when working with files in your repository. This feature is integrated into the ContextManager and can be configured globally or per operation.

## Configuration

Configure gitignore support in your `repofm.config.json`:

```json
{
  "context": {
    "respectGitIgnore": true,
    "excludePatterns": [
      "node_modules/**",
      "*.log",
      "dist/",
      "coverage/"
    ],
    "ignoreCase": true
  }
}
```

## Features

1. **Pattern Matching**
   - Supports glob patterns
   - Case-sensitive and case-insensitive matching
   - Handles nested patterns

2. **Performance**
   - Efficient pattern matching
   - Caches results for better performance
   - Minimal overhead

3. **Integration**
   - Works with ContextManager
   - Supports temporary overrides
   - Configurable per operation

## Usage

```typescript
// Initialize with patterns
const contextManager = ContextManager.getInstance({
  excludePatterns: ['node_modules/**', '*.log'],
  ignoreCase: true
});

// Check if file should be included
const isValid = contextManager.isValidSourceFile('src/index.ts');

// Use with temporary context
await contextManager.withTemporaryContext({
  excludePatterns: ['*.test.ts']
}, async () => {
  // Do something with different patterns
});
```

## Best Practices

1. Use specific patterns when possible
2. Consider case sensitivity requirements
3. Test patterns with sample paths
4. Document custom patterns
5. Review and update patterns regularly
