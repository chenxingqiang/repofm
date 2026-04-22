import { describe, expect, it } from 'vitest';
import { formatDashboard } from '../../src/utils/formatDashboard.js';

describe('formatDashboard', () => {
  it('should serialize object to pretty-printed JSON', () => {
    const data = { key: 'value' };
    const result = formatDashboard(data);
    expect(result).toBe(JSON.stringify(data, null, 2));
  });

  it('should handle nested objects', () => {
    const data = { a: { b: { c: 1 } } };
    const result = formatDashboard(data);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(data);
  });

  it('should handle arrays', () => {
    const data = [1, 2, 3];
    const result = formatDashboard(data);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(data);
  });

  it('should handle empty object', () => {
    const result = formatDashboard({});
    expect(result).toBe('{}');
  });

  it('should handle null', () => {
    const result = formatDashboard(null);
    expect(result).toBe('null');
  });

  it('should handle numbers', () => {
    const result = formatDashboard(42);
    expect(result).toBe('42');
  });

  it('should handle strings', () => {
    const result = formatDashboard('hello');
    expect(result).toBe('"hello"');
  });

  it('should produce indented output', () => {
    const data = { name: 'test', value: 1 };
    const result = formatDashboard(data);
    expect(result).toContain('  ');
    expect(result).toContain('\n');
  });
});
