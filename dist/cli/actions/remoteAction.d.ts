import type { CliOptions } from '../../types/config.js';
export declare const runRemoteAction: (repoUrl: string, options?: CliOptions) => Promise<void>;
export declare const formatGitUrl: (url: string) => string;
