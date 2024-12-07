export class OutputGenerator {
    constructor(options = {}) {
        this.options = options;
    }
    generate(data) {
        const { format = 'json', pretty = true } = this.options;
        switch (format) {
            case 'json':
                return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
            case 'text':
                return this.generateTextOutput(data);
            case 'markdown':
                return this.generateMarkdownOutput(data);
            default:
                return JSON.stringify(data);
        }
    }
    generateTextOutput(data) {
        // Implement text output generation
        return typeof data === 'string' ? data : JSON.stringify(data);
    }
    generateMarkdownOutput(data) {
        // Implement markdown output generation
        return `# Output\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    }
}
export default OutputGenerator;
//# sourceMappingURL=outputGenerator.js.map