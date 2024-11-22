var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logger } from '../../shared/logger.js';
export const runSecurityCheck = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    for (const file of files) {
        const issues = yield runSecretLint(file.path, file.content);
        if (issues.messages.length > 0) {
            results.push({
                filePath: file.path,
                messages: issues.messages
            });
        }
    }
    return results;
});
export function runSecretLint(filePath_1, content_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, content, config = {}) {
        const messages = [];
        try {
            // 检查 API 密钥
            if (/api[_-]?key|api[_-]?secret/i.test(content)) {
                messages.push('Potential API key/secret detected');
            }
            // 检查 AWS 凭证
            if (/aws[_-]?access[_-]?key|aws[_-]?secret/i.test(content)) {
                messages.push('AWS credentials detected');
            }
            // 检查私钥
            if (/BEGIN (?:RSA |DSA )?PRIVATE KEY/.test(content)) {
                messages.push('Private key detected');
            }
            // 检查密码
            if (/password\s*=\s*['"][^'"]+['"]/.test(content)) {
                messages.push('Hardcoded password detected');
            }
            // 检查其他敏感信息
            const sensitivePatterns = [
                /token\s*=\s*['"][^'"]+['"]/,
                /secret\s*=\s*['"][^'"]+['"]/,
                /credentials?\s*=\s*['"][^'"]+['"]/
            ];
            for (const pattern of sensitivePatterns) {
                if (pattern.test(content)) {
                    messages.push('Sensitive information detected');
                }
            }
        }
        catch (error) {
            logger.warn(`Error checking file ${filePath}:`, error);
            messages.push('Error during security check');
        }
        return { messages };
    });
}
//# sourceMappingURL=securityCheck.js.map