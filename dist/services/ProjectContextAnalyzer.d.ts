export interface ProjectContext {
    projectType: string;
    mainLanguages: string[];
    frameworksLibraries: string[];
    commitStyles: string[];
    ignoredPaths: string[];
}
export declare class ProjectContextAnalyzer {
    /**
     * Analyze project structure and generate context
     * @param projectRoot Root directory of the project
     * @returns Detailed project context
     */
    static analyzeProjectContext(projectRoot?: string): Promise<ProjectContext>;
    /**
     * Generate a context-aware system prompt for AI
     * @param context Project context
     * @returns Tailored system prompt
     */
    static generateSystemPrompt(context: ProjectContext): string;
}
