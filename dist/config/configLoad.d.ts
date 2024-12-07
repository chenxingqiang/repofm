import type { Config, CliOptions } from '../types/config.js';
export declare function createDefaultConfig(cwd: string, options?: Partial<CliOptions & Config>): Config;
export declare function loadFileConfig(cwd: string, configFile?: string | null): Promise<Partial<Config>>;
export declare function mergeConfigs(cwd: string, fileConfig?: Partial<Config>, cliConfig?: Partial<CliOptions>): Config;
export declare function loadConfig(cwd: string, options?: {
    global?: boolean;
}): Promise<Config>;
