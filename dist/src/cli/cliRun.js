var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import process from 'node:process';
import { program } from 'commander';
import pc from 'picocolors';
import { getVersion } from '../core/file/packageJsonParse.js';
import { handleError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { runRemoteAction } from './actions/remoteAction.js';
import { runVersionAction } from './actions/versionAction.js';
export function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const version = yield getVersion();
            program
                .description('repofm - Pack your repository into a single AI-friendly file')
                .arguments('[directory]')
                .option('-v, --version', 'show version information')
                .option('-o, --output <file>', 'specify the output file name')
                .option('--include <patterns>', 'list of include patterns (comma-separated)')
                .option('-i, --ignore <patterns>', 'additional ignore patterns (comma-separated)')
                .option('-c, --config <path>', 'path to a custom config file')
                .option('--copy', 'copy generated output to system clipboard')
                .option('--top-files-len <number>', 'specify the number of top files to display', Number.parseInt)
                .option('--output-show-line-numbers', 'add line numbers to each line in the output')
                .option('--style <type>', 'specify the output style (plain, xml, markdown)')
                .option('--verbose', 'enable verbose logging for detailed output')
                .option('--init', 'initialize a new repofm.config.json file')
                .option('--global', 'use global configuration (only applicable with --init)')
                .option('--remote <url>', 'process a remote Git repository')
                .action((directory = '.', options) => executeAction({
                directory,
                cwd: process.cwd(),
                options
            }));
            yield program.parseAsync(process.argv);
        }
        catch (error) {
            handleError(error);
        }
    });
}
const executeAction = (_a) => __awaiter(void 0, [_a], void 0, function* ({ directory, cwd, options }) {
    logger.setVerbose(options.verbose || false);
    if (options.version) {
        yield runVersionAction();
        return;
    }
    const version = yield getVersion();
    logger.log(pc.dim(`\n📦 repofm v${version}\n`));
    if (options.init) {
        yield runInitAction(cwd, options.global || false);
        return;
    }
    if (options.remote) {
        yield runRemoteAction(options.remote, options);
        return;
    }
    yield runDefaultAction({
        cwd: directory,
        config: {
            include: options.include ? options.include.split(',') : ['**/*'],
            ignore: {
                customPatterns: options.ignore ? options.ignore.split(',') : [],
                useDefaultPatterns: true,
                useGitignore: true
            },
            output: {
                filePath: options.output || 'repofm-output.txt',
                style: options.style || 'plain',
                removeComments: false,
                removeEmptyLines: false,
                showLineNumbers: options.outputShowLineNumbers || false,
                copyToClipboard: options.copy || false,
                topFilesLength: options.topFilesLen || 10
            },
            security: {
                enableSecurityCheck: true
            }
        }
    });
});
//# sourceMappingURL=cliRun.js.map