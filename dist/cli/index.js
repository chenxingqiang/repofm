import { createSpinner } from './spinnerFactory.js';
export async function runCLI() {
    const spinner = createSpinner();
    try {
        spinner.start('Initializing...');
        // ... rest of CLI logic ...
        spinner.succeed('Operation completed successfully');
    }
    catch (error) {
        if (error instanceof Error) {
            spinner.fail(`Operation failed: ${error.message}`);
        }
        else {
            spinner.fail('Operation failed: An unknown error occurred');
        }
        process.exit(1);
    }
}
