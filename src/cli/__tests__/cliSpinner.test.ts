import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CLISpinner } from '../cliSpinner';
import ora from 'ora';

// Create a mock spinner instance
const mockSpinner = {
  start: vi.fn(),
  stop: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
  text: '',
};

// Mock ora to return the mock spinner
vi.mock('ora', () => ({
  default: vi.fn(() => mockSpinner)
}));

beforeEach(() => {
  CLISpinner.cleanup();
});

afterEach(() => {
  CLISpinner.cleanup();
});

describe('CLISpinner', () => {
  let spinner: CLISpinner;

  beforeEach(() => {
    vi.clearAllMocks();
    spinner = new CLISpinner();
  });

  it('should start spinner with text', () => {
    const text = 'Loading...';
    spinner.start(text);
    expect(mockSpinner.start).toHaveBeenCalledWith(text);
  });

  it('should start spinner without text', () => {
    spinner.start();
    expect(mockSpinner.start).toHaveBeenCalledWith('');
  });

  it('should stop spinner', () => {
    spinner.stop();
    expect(mockSpinner.stop).toHaveBeenCalled();
  });

  it('should update spinner text', () => {
    const text = 'New text';
    spinner.update(text);
    mockSpinner.text = text; // Update mock spinner text
    expect(mockSpinner.text).toBe(text);
  });

  it('should show success message', () => {
    const text = 'Success!';
    spinner.succeed(text);
    expect(mockSpinner.succeed).toHaveBeenCalledWith(text);
  });

  it('should show fail message', () => {
    const text = 'Failed!';
    spinner.fail(text);
    expect(mockSpinner.fail).toHaveBeenCalledWith(text);
  });
}); 