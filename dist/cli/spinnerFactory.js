import { CLISpinner } from './cliSpinner.js';
export function createSpinner() {
    return {
        start: CLISpinner.start.bind(CLISpinner),
        stop: CLISpinner.stop.bind(CLISpinner),
        succeed: CLISpinner.succeed.bind(CLISpinner),
        fail: CLISpinner.fail.bind(CLISpinner),
    };
}
//# sourceMappingURL=spinnerFactory.js.map