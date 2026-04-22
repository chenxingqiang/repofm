import Handlebars from 'handlebars';
Handlebars.registerHelper('getFileExtension', (filePath) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'vue':
            return 'vue';
        case 'py':
            return 'python';
        case 'rb':
            return 'ruby';
        case 'java':
            return 'java';
        case 'c':
        case 'cpp':
            return 'cpp';
        case 'cs':
            return 'csharp';
        case 'go':
            return 'go';
        case 'rs':
            return 'rust';
        case 'php':
            return 'php';
        case 'swift':
            return 'swift';
        case 'kt':
            return 'kotlin';
        case 'scala':
            return 'scala';
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'scss':
        case 'sass':
            return 'scss';
        case 'json':
            return 'json';
        case 'json5':
            return 'json5';
        case 'xml':
            return 'xml';
        case 'yaml':
        case 'yml':
            return 'yaml';
        case 'md':
            return 'markdown';
        case 'sh':
        case 'bash':
            return 'bash';
        case 'sql':
            return 'sql';
        case 'dockerfile':
            return 'dockerfile';
        case 'dart':
            return 'dart';
        case 'fs':
        case 'fsx':
            return 'fsharp';
        case 'r':
            return 'r';
        case 'pl':
        case 'pm':
            return 'perl';
        case 'lua':
            return 'lua';
        case 'groovy':
            return 'groovy';
        case 'hs':
            return 'haskell';
        case 'ex':
        case 'exs':
            return 'elixir';
        case 'erl':
            return 'erlang';
        case 'clj':
        case 'cljs':
            return 'clojure';
        case 'ps1':
            return 'powershell';
        case 'vb':
            return 'vb';
        case 'coffee':
            return 'coffeescript';
        case 'tf':
        case 'tfvars':
            return 'hcl';
        case 'proto':
            return 'protobuf';
        case 'pug':
            return 'pug';
        case 'graphql':
        case 'gql':
            return 'graphql';
        case 'toml':
            return 'toml';
        default:
            return '';
    }
});
Handlebars.registerHelper('formatTreeStructure', function () {
    const files = this.processedFiles;
    const tree = formatTreeStructure(files.map((file) => file.path));
    return new Handlebars.SafeString(tree);
});
export const getMarkdownTemplate = () => {
    return /* md */ `
{{{generationHeader}}}

# File Summary

## Purpose
{{{summaryPurpose}}}

## File Format
{{{summaryFileFormat}}}

## Usage Guidelines
{{{summaryUsageGuidelines}}}

## Notes
{{{summaryNotes}}}

## Additional Info
{{#if headerText}}
### User Provided Header
{{{headerText}}}
{{/if}}

{{{summaryAdditionalInfo}}}

# Repository Structure
{{{formatTreeStructure}}}

# Repository Files

Files processed: {{processedFiles.length}}

{{#each processedFiles}}
## File: {{{this.path}}}
\`\`\`{{{getFileExtension this.path}}}
{{#if config.output.showLineNumbers}}
{{#each this.content.split '\\n' as |line i|}}
{{i + 1}}. {{{line}}}
{{/each}}
{{else}}
{{#if config.output.removeComments}}
{{{this.content.replace /\/\*[\s\S]*?\*\/|\/\/.*/g ''}}}
{{else}}
{{{this.content}}}
{{/if}}
{{/if}}
\`\`\`

{{/each}}

{{#if instruction}}
# Instruction
{{{instruction}}}
{{/if}}
`;
};
function formatTreeStructure(files) {
    const tree = {};
    files.forEach(file => {
        const parts = file.split('/');
        let current = tree;
        parts.forEach(part => {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        });
    });
    function renderTree(node, indent = '') {
        let output = '';
        Object.keys(node).sort().forEach(key => {
            const isFile = Object.keys(node[key]).length === 0;
            output += `${indent}- ${key}${isFile ? '' : '/'}\n`;
            if (!isFile) {
                output += renderTree(node[key], indent + '  ');
            }
        });
        return output;
    }
    return renderTree(tree);
}
//# sourceMappingURL=markdownStyle.js.map