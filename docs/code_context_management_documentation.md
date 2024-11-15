# Code Context Management Documentation

The Code Context Management feature allows you to extract, analyze, and maintain contextual information about your code. This document covers usage patterns and examples for different scenarios.

## Configuration

Add the following to your `repofm.config.json`:

```json
{
  "context": {
    "outputFormat": "markdown",
    "maxDepth": 2,
    "includeImports": true,
    "includeExports": true,
    "maxContextLines": 100,
    "excludePatterns": [
      "node_modules",
      ".git"
    ],
    "cacheEnabled": true,
    "cachePath": ".repofm/context-cache"
  }
}
```

## CLI Usage Examples

### 1. Extract Function Context

```bash
# Get context for a specific function
repofm context extract --target "handleSubmit" --type function --file src/components/Form.js

# Get deeper context analysis
repofm context extract --target "handleSubmit" --type function --file src/components/Form.js --depth 2

# Save context to file
repofm context extract --target "handleSubmit" --type function --file src/components/Form.js --save context.md
```

Example output:

```markdown
# Code Context: handleSubmit

## Definition
```javascript
function handleSubmit(event) {
  event.preventDefault();
  // ... function implementation
}
```

## Dependencies

- validateForm (./utils/validation.js)
- submitData (./api/submit.js)

## Callers

- SubmitButton (./components/SubmitButton.js:15)
- FormWrapper (./components/FormWrapper.js:42)

## Related Tests

- Form.test.js
  - "should handle submission correctly"
  - "should validate before submit"

```

### 2. Extract File Context

```bash
# Get context for an entire file
repofm context extract --target src/components/Form.js --type file

# Include specific depth of imports and exports
repofm context extract --target src/components/Form.js --type file --depth 2 --include-imports --include-exports
```

### 3. Extract Character Context

```bash
# Get context for a specific position in code
repofm context extract --target "150:10" --type character --file src/components/Form.js
```

### 4. Search Within Contexts

```bash
# Search for specific patterns
repofm context search --query "handleSubmit" --path src/components

# Search with type filter
repofm context search --query "handleSubmit" --type function --json
```

### 5. Cache Management

```bash
# List cached contexts
repofm context cache --list

# Clear cache
repofm context cache --clear

# Rebuild cache
repofm context cache --rebuild
```

## API Usage

You can also use the Code Context Manager programmatically:

```javascript
import { CodeContextManager } from 'repofm';

const manager = new CodeContextManager({
  outputFormat: 'markdown',
  maxDepth: 2
});

// Get function context
const context = await manager.getContext({
  target: 'handleSubmit',
  type: 'function',
  file: 'src/components/Form.js',
  depth: 2
});

// Search contexts
const results = await manager.searchContext({
  query: 'handleSubmit',
  path: 'src/components'
});
```

## Output Formats

### Markdown Format

- Function definitions with syntax highlighting
- Dependency trees
- Usage examples
- Related test cases
- Import/Export analysis

### XML Format

```xml
<codeContext>
  <target>handleSubmit</target>
  <type>function</type>
  <content>
    <definition><![CDATA[
      function handleSubmit(event) {
        // ... function implementation
      }
    ]]></definition>
    <dependencies>
      <dependency path="./utils/validation.js">validateForm</dependency>
      <dependency path="./api/submit.js">submitData</dependency>
    </dependencies>
  </content>
</codeContext>
```

### Plain Text Format

```
Target: handleSubmit
Type: function
File: src/components/Form.js

Definition:
function handleSubmit(event) {
  // ... function implementation
}

Dependencies:
- validateForm (./utils/validation.js)
- submitData (./api/submit.js)
```

## Best Practices

1. **Cache Management**
   - Regularly rebuild cache for large codebases
   - Clear cache when switching branches
   - Use `--depth` judiciously as higher depths increase analysis time

2. **Search Optimization**
   - Use specific paths to limit search scope
   - Combine with type filters for precise results
   - Use JSON output for programmatic processing

3. **Context Extraction**
   - Start with function-level context for specific analyses
   - Use file-level context for overview and dependencies
   - Use character-level context for precise reference lookups

4. **Output Format Selection**
   - Use Markdown for human-readable documentation
   - Use XML for structured data processing
   - Use JSON for programmatic integration
