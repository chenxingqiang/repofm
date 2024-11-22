import { get_encoding } from 'tiktoken';
import { logger } from '../../shared/logger.js';
export class TokenCounter {
    constructor() {
        try {
            this.encoding = get_encoding('cl100k_base');
        }
        catch (error) {
            logger.error('Failed to initialize token counter:', error);
            throw error;
        }
    }
    countTokens(content, options = { model: 'gpt-4' }) {
        try {
            if (typeof content !== 'string') {
                logger.warn(`Invalid input type: ${typeof content}, expected string`);
                return 0;
            }
            if (!content) {
                return 0;
            }
            const normalizedContent = content
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n');
            const trimmedContent = normalizedContent
                .split('\n')
                .filter(line => line.trim().length > 0)
                .join('\n');
            try {
                const tokens = this.encoding.encode(trimmedContent);
                return tokens.length;
            }
            catch (encodingError) {
                logger.warn('Tiktoken encoding failed, using fallback method:', encodingError);
                return this.fallbackTokenCount(trimmedContent);
            }
        }
        catch (error) {
            logger.warn('Error counting tokens:', error);
            return this.fallbackTokenCount(String(content));
        }
    }
    fallbackTokenCount(text) {
        return text
            .split(/[\s\n]+/)
            .filter(token => token.length > 0)
            .length;
    }
    free() {
        try {
            this.encoding.free();
        }
        catch (error) {
            logger.warn('Error while freeing token counter:', error);
        }
    }
}
//# sourceMappingURL=tokenCount.js.map