import { describe, it, expect, vi, beforeEach } from 'vitest.js';
import { CLISpinner } from '../cliSpinner.js';
vi.mock('ora', () => {
    return {
        default: vi.fn(() => ({
            start: vi.fn().mockReturnThis(),
            stop: vi.fn().mockReturnThis(),
            succeed: vi.fn().mockReturnThis(),
            fail: vi.fn().mockReturnThis(),
        }))
    };
});
describe('CLISpinner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('should start spinner with text', () => {
        const text = 'Loading...';
        const spinner = CLISpinner.start(text);
        expect(spinner.start).toHaveBeenCalled();
    });
    // ... other test cases
});
