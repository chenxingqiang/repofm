var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { globby } from 'globby';
const DEFAULT_CONFIG = {
    patterns: ['**/*'],
    ignore: {
        patterns: [],
        useGitignore: true,
        useDefaultPatterns: true,
    },
    dot: false,
    followSymlinks: false,
};
export const searchFiles = (rootDir_1, ...args_1) => __awaiter(void 0, [rootDir_1, ...args_1], void 0, function* (rootDir, config = {}) {
    const finalConfig = Object.assign(Object.assign(Object.assign({}, DEFAULT_CONFIG), config), { ignore: Object.assign(Object.assign({}, DEFAULT_CONFIG.ignore), (config.ignore || {})) });
    const options = {
        cwd: rootDir,
        absolute: false,
        dot: finalConfig.dot,
        followSymbolicLinks: finalConfig.followSymlinks,
        ignore: finalConfig.ignore.patterns,
        gitignore: finalConfig.ignore.useGitignore,
    };
    return yield globby(finalConfig.patterns, options);
});
//# sourceMappingURL=fileSearch.js.map