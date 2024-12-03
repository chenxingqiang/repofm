import { pack } from '../../core/packager.js';
import type { Config } from '../../types/config.js';
import type { CliOptions } from '../types.js';
import { loadConfig } from '../../config/configLoad.js';

export async function runDefaultAction(
  options: CliOptions
): Promise<boolean> {
  try {
    const config = await loadConfig(options.cwd);
    const result = await pack(options.cwd, config);
    return result.totalFiles > 0;
  } catch (error) {
    console.error('Error in default action:', error);
    return false;
  }
}
