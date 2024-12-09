import { logger } from '../shared/logger.js';
import { generateStructuredCommitMessage } from '../ai/ModelProviders.js';
import { ProjectContextAnalyzer } from './ProjectContextAnalyzer.js';
export class AICommitGenerator {
    /**
     * Generate a comprehensive, context-aware commit message
     * @param options Options for commit message generation
     * @returns Generated commit message
     */
    static async generateCommitMessage(options) {
        const { stagedFiles, maxLength = 72, cwd = process.cwd(), provider = 'groq' } = options;
        try {
            // Analyze project context
            const projectContext = await ProjectContextAnalyzer.analyzeProjectContext(cwd);
            logger.info('Project context analyzed', projectContext);
            // Generate structured commit message
            const { message: generatedMessage, metadata } = await generateStructuredCommitMessage(stagedFiles, {
                provider,
                maxLength,
                temperature: projectContext.commitStyles.includes('Conventional Commits') ? 0.5 : 0.7
            });
            // Log generation metadata
            logger.info('Commit message generated', {
                provider: metadata.provider,
                length: metadata.length,
                fileTypes: metadata.fileTypes
            });
            return generatedMessage;
        }
        catch (error) {
            logger.error('Commit message generation failed', error);
            // Fallback commit message
            return `Update ${stagedFiles.length} file(s)`;
        }
    }
    /**
     * Validate and clean generated commit message
     * @param message Generated commit message
     * @param maxLength Maximum allowed length
     * @returns Validated commit message
     */
    static validateCommitMessage(message, maxLength = 72) {
        // Trim and remove any trailing punctuation
        let cleanedMessage = message
            .trim()
            .replace(/[.!?]+$/, '')
            .replace(/\n/g, ' ');
        // Enforce maximum length
        if (cleanedMessage.length > maxLength) {
            cleanedMessage = cleanedMessage.substring(0, maxLength);
        }
        // Fallback if message is empty
        return cleanedMessage || 'Update project files';
    }
}
