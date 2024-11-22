import { type repofmConfigCli, type repofmConfigFile, type repofmConfigMerged } from './configSchema.js';
export declare const loadFileConfig: (rootDir: string, argConfigPath: string | null) => Promise<repofmConfigFile>;
export declare const mergeConfigs: (cwd: string, fileConfig: repofmConfigFile, cliConfig: repofmConfigCli) => repofmConfigMerged;
//# sourceMappingURL=configLoad.d.ts.map