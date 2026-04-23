import { describe, expect, it } from 'vitest';
import { formatDashboard } from '../../src/utils/formatDashboard.js';

describe('formatDashboard', () => {
  it('should return JSON string of the input data', () => {
    const data = { key: 'value' };
    const result = formatDashboard(data);
    expect(JSON.parse(result)).toEqual(data);
  });

  it('should pretty-print JSON with 2-space indentation', () => {
    const data = { a: 1, b: 2 };
    const result = formatDashboard(data);
    expect(result).toBe(JSON.stringify(data, null, 2));
  });

  it('should handle nested objects', () => {
    const data = { outer: { inner: { value: 42 } } };
    const result = formatDashboard(data);
    const parsed = JSON.parse(result);
    expect(parsed.outer.inner.value).toBe(42);
  });

  it('should handle arrays', () => {
    const data = [1, 2, 3];
    const result = formatDashboard(data);
    expect(JSON.parse(result)).toEqual([1, 2, 3]);
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

  it('should handle boolean values', () => {
    expect(formatDashboard(true)).toBe('true');
    expect(formatDashboard(false)).toBe('false');
  });

  it('should handle mixed data types in object', () => {
    const data = {
      name: 'test',
      count: 5,
      active: true,
      tags: ['a', 'b'],
      meta: null,
    };
    const result = formatDashboard(data);
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('test');
    expect(parsed.count).toBe(5);
    expect(parsed.active).toBe(true);
    expect(parsed.tags).toEqual(['a', 'b']);
    expect(parsed.meta).toBeNull();
  });
});
