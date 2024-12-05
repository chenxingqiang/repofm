import { pack } from '../../core/packager.js';
import type { Config, CliOptions } from '../../types/config.js';
import { loadConfig, createDefaultConfig } from '../../config/configLoad.js';

export async function runDefaultAction(
  currentCwd: string, 
  options: Partial<CliOptions> = {}
): Promise<boolean> {
  try {
    const loadedConfig = await loadConfig(currentCwd);
    const defaultConfig = createDefaultConfig(currentCwd);
    const finalConfig: Config & { cwd: string } = {
      ...defaultConfig,
      ...loadedConfig,
      cwd: currentCwd,
      output: {
        ...defaultConfig.output,
        ...loadedConfig.output,
        ...(typeof options.output === 'string' ? { filePath: options.output } : {}),
        copyToClipboard: options.copy ?? loadedConfig.output?.copyToClipboard ?? defaultConfig.output.copyToClipboard
      },
      security: {
        ...defaultConfig.security,
        ...loadedConfig.security,
        enableSecurityCheck: options.security ?? loadedConfig.security?.enableSecurityCheck ?? defaultConfig.security.enableSecurityCheck
      }
    };

    const result = await pack(currentCwd, finalConfig, createDefaultDependencies());
    return result.totalFiles > 0;
  } catch (error) {
    console.error('Error in default action:', error);
    return false;
  }
}
