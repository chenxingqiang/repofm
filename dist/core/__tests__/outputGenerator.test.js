import { describe, it, expect } from 'vitest.js';
import { OutputGenerator } from '../outputGenerator.js';
describe('OutputGenerator', () => {
    it('should generate JSON output', () => {
        const generator = new OutputGenerator({ format: 'json' });
        const data = { test: 'value' };
        expect(generator.generate(data)).toBe(JSON.stringify(data, null, 2));
    });
    it('should generate text output', () => {
        const generator = new OutputGenerator({ format: 'text' });
        const data = 'test string';
        expect(generator.generate(data)).toBe(data);
    });
    it('should generate markdown output', () => {
        const generator = new OutputGenerator({ format: 'markdown' });
        const data = { test: 'value' };
        expect(generator.generate(data)).toContain('```json');
    });
});
