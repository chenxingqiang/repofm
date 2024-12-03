import { describe, it, expect } from 'vitest';
import { generateOutput } from '../../src/core/packager';

describe('Packager Integration', () => {
  it('should handle complex data structures', () => {
    const complexData = {
      nested: {
        array: [1, 2, 3],
        object: { key: 'value' }
      },
      date: new Date('2024-01-01').toISOString()
    };

    const result = generateOutput({
      data: complexData,
      format: 'json',
      pretty: true
    });

    expect(JSON.parse(result)).toEqual(complexData);
  });

  it('should handle different output formats', () => {
    const data = { test: 'value' };
    
    const jsonOutput = generateOutput({ data, format: 'json' });
    expect(JSON.parse(jsonOutput)).toEqual(data);

    const markdownOutput = generateOutput({ data, format: 'markdown' });
    expect(markdownOutput).toContain('```json');
  });
});
