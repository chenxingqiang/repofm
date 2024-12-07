import { getVersion } from '../../core/file/packageJsonParse.js';
import { logger } from '../../shared/logger.js';
export const runVersionAction = async () => {
    const version = await getVersion();
    logger.log(version);
};
//# sourceMappingURL=versionAction.js.map