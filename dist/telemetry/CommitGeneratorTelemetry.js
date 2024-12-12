import { performance } from 'node:perf_hooks';
import fs from 'node:fs/promises';
import path from 'node:path';
export class CommitGeneratorTelemetry {
    /**
     * Log commit generation metrics
     */
    static async logMetrics(metrics) {
        const fullMetrics = {
            timestamp: Date.now(),
            processingTime: 0,
            aiModel: 'default',
            messageLength: 0,
            generationStrategy: 'fallback',
            projectContext: 'unknown',
            ...metrics
        };
        try {
            await fs.mkdir(this.TELEMETRY_DIR, { recursive: true });
            const logFile = path.join(this.TELEMETRY_DIR, `commit_metrics_${new Date().toISOString().split('T')[0]}.json`);
            const existingMetrics = await this.readExistingMetrics(logFile);
            existingMetrics.push(fullMetrics);
            await fs.writeFile(logFile, JSON.stringify(existingMetrics, null, 2));
        }
        catch (error) {
            console.error('Telemetry logging failed', error);
        }
    }
    /**
     * Measure commit message generation performance
     */
    static async measureGeneration(generationFunc) {
        const startTime = performance.now();
        try {
            const result = await generationFunc();
            const endTime = performance.now();
            const metrics = {
                timestamp: Date.now(),
                processingTime: endTime - startTime,
                aiModel: 'default',
                messageLength: String(result).length,
                generationStrategy: 'ai',
                projectContext: process.cwd()
            };
            await this.logMetrics(metrics);
            return { result, metrics };
        }
        catch (error) {
            const endTime = performance.now();
            const metrics = {
                timestamp: Date.now(),
                processingTime: endTime - startTime,
                aiModel: 'default',
                messageLength: 0,
                generationStrategy: 'fallback',
                projectContext: process.cwd()
            };
            await this.logMetrics(metrics);
            throw error;
        }
    }
    /**
     * Read existing metrics file
     */
    static async readExistingMetrics(logFile) {
        try {
            const fileContent = await fs.readFile(logFile, 'utf-8');
            return JSON.parse(fileContent);
        }
        catch {
            return [];
        }
    }
    /**
     * Analyze telemetry data
     */
    static async analyzeTelemetry() {
        const telemetryFiles = await fs.readdir(this.TELEMETRY_DIR);
        const allMetrics = [];
        for (const file of telemetryFiles) {
            const filePath = path.join(this.TELEMETRY_DIR, file);
            const fileMetrics = await this.readExistingMetrics(filePath);
            allMetrics.push(...fileMetrics);
        }
        const successfulGenerations = allMetrics.filter(metric => metric.generationStrategy === 'ai');
        return {
            averageProcessingTime: successfulGenerations.reduce((sum, m) => sum + m.processingTime, 0) /
                successfulGenerations.length,
            totalGenerations: allMetrics.length,
            successRate: successfulGenerations.length / allMetrics.length
        };
    }
}
CommitGeneratorTelemetry.TELEMETRY_DIR = path.join(process.cwd(), '.repofm', 'telemetry');
export const commitTelemetry = CommitGeneratorTelemetry;
//# sourceMappingURL=CommitGeneratorTelemetry.js.map