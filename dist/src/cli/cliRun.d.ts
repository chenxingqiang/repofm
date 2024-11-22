import { type OptionValues } from 'commander';
import type { repofmOutputStyle } from '../config/configSchema.js';
export interface CliOptions extends OptionValues {
    version?: boolean;
    output?: string;
    include?: string;
    ignore?: string;
    config?: string;
    copy?: boolean;
    verbose?: boolean;
    topFilesLen?: number;
    outputShowLineNumbers?: boolean;
    style?: repofmOutputStyle;
    init?: boolean;
    global?: boolean;
    remote?: string;
}
export declare function run(): Promise<void>;
//# sourceMappingURL=cliRun.d.ts.map