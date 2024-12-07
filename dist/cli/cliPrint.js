import path from 'node:path';
import pc from 'picocolors';
import { logger } from '../shared/logger.js';
export const printSummary = (totalFiles, totalCharacters, totalTokens, outputPath, suspiciousFilesResults, config) => {
    let securityCheckMessage = '';
    if (config.security.enableSecurityCheck) {
        if (suspiciousFilesResults.length > 0) {
            securityCheckMessage = pc.yellow(`${suspiciousFilesResults.length} suspicious file(s) detected and excluded`);
        }
        else {
            securityCheckMessage = pc.white('✔ No suspicious files detected');
        }
    }
    else {
        securityCheckMessage = pc.dim('Security check disabled');
    }
    logger.info(pc.white('📊 Pack Summary:'));
    logger.info(pc.dim('────────────────'));
    logger.info(`${pc.white('  Total Files:')} ${pc.white(totalFiles.toString())}`);
    logger.info(`${pc.white('  Total Chars:')} ${pc.white(totalCharacters.toString())}`);
    logger.info(`${pc.white(' Total Tokens:')} ${pc.white(totalTokens.toString())}`);
    logger.info(`${pc.white('       Output:')} ${pc.white(outputPath)}`);
    logger.info(`${pc.white('     Security:')} ${pc.white(securityCheckMessage)}`);
};
export const printSecurityCheck = (rootDir, suspiciousFilesResults, config) => {
    if (!config.security.enableSecurityCheck) {
        return;
    }
    logger.info(pc.white('🔎 Security Check:'));
    logger.info(pc.dim('──────────────────'));
    if (suspiciousFilesResults.length === 0) {
        logger.info(`${pc.green('✔')} ${pc.white('No suspicious files detected.')}`);
    }
    else {
        logger.info(pc.yellow(`${suspiciousFilesResults.length} suspicious file(s) detected and excluded from the output:`));
        suspiciousFilesResults.forEach((suspiciousFilesResult, index) => {
            const relativeFilePath = path.relative(rootDir, suspiciousFilesResult.filePath);
            logger.info(`${pc.white(`${index + 1}.`)} ${pc.white(relativeFilePath)}`);
            logger.info(pc.dim(`   - ${suspiciousFilesResult.messages.join('\n   - ')}`));
        });
        logger.info(pc.yellow('\nThese files have been excluded from the output for security reasons.'));
        logger.info(pc.yellow('Please review these files for potential sensitive information.'));
    }
};
export const printTopFiles = (fileCharCounts, fileTokenCounts, topFilesLength) => {
    logger.info(pc.white(`📈 Top ${topFilesLength} Files by Character Count and Token Count:`));
    logger.info(pc.dim('──────────────────────────────────────────────────────'));
    const topFiles = Object.entries(fileCharCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topFilesLength);
    topFiles.forEach(([filePath, charCount], index) => {
        const tokenCount = fileTokenCounts[filePath];
        const indexString = `${index + 1}.`.padEnd(3, ' ');
        logger.info(`${pc.white(`${indexString}`)} ${pc.white(filePath)} ${pc.dim(`(${charCount} chars, ${tokenCount} tokens)`)}`);
    });
};
export const printCompletion = () => {
    logger.info(pc.green('🎉 All Done!'));
    logger.info(pc.white('Your repository has been successfully packed.'));
};
//# sourceMappingURL=cliPrint.js.map