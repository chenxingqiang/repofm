export interface OutputGeneratorOptions {
  format?: 'json' | 'text' | 'markdown';
  pretty?: boolean;
}

export class OutputGenerator {
  constructor(private options: OutputGeneratorOptions = {}) {}

  generate(data: any): string {
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

  private generateTextOutput(data: any): string {
    // Implement text output generation
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  private generateMarkdownOutput(data: any): string {
    // Implement markdown output generation
    return `# Output\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }
}

export default OutputGenerator; 