import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../shared/logger.js';

export interface ProjectContext {
  projectType: string;
  mainLanguages: string[];
  frameworksLibraries: string[];
  commitStyles: string[];
  ignoredPaths: string[];
}

export class ProjectContextAnalyzer {
  /**
   * Analyze project structure and generate context
   * @param projectRoot Root directory of the project
   * @returns Detailed project context
   */
  static async analyzeProjectContext(
    projectRoot: string = process.cwd()
  ): Promise<ProjectContext> {
    try {
      // Detect project type and languages
      const context: ProjectContext = {
        projectType: 'unknown',
        mainLanguages: [],
        frameworksLibraries: [],
        commitStyles: [],
        ignoredPaths: []
      };

      // Detect project type and languages
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
      const gitIgnorePath = path.join(projectRoot, '.gitignore');

      // Read package.json
      try {
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, 'utf-8')
        );

        // Detect project type
        if (packageJson.dependencies) {
          const deps = Object.keys(packageJson.dependencies);
          
          // Framework detection
          const frameworkMap: {[key: string]: string} = {
            'react': 'React',
            'vue': 'Vue',
            'angular': 'Angular',
            'express': 'Express',
            'nestjs': 'NestJS',
            'next': 'Next.js',
            'nuxt': 'Nuxt.js'
          };

          context.frameworksLibraries = deps
            .filter(dep => frameworkMap[dep])
            .map(dep => frameworkMap[dep]);

          // Language detection
          if (packageJson.devDependencies?.typescript) {
            context.mainLanguages.push('TypeScript');
          } else {
            context.mainLanguages.push('JavaScript');
          }

          // Project type inference
          if (context.frameworksLibraries.length > 0) {
            context.projectType = context.frameworksLibraries[0];
          } else if (packageJson.scripts?.build) {
            context.projectType = 'Web Application';
          }
        }
      } catch (err) {
        logger.warn('Could not read package.json:', err);
      }

      // Read tsconfig for TypeScript projects
      try {
        await fs.access(tsConfigPath);
        if (!context.mainLanguages.includes('TypeScript')) {
          context.mainLanguages.push('TypeScript');
        }
      } catch {}

      // Read .gitignore for ignored paths
      try {
        const gitIgnoreContent = await fs.readFile(gitIgnorePath, 'utf-8');
        context.ignoredPaths = gitIgnoreContent
          .split('\n')
          .filter(line => 
            line.trim() && 
            !line.startsWith('#') && 
            !line.includes('*')
          );
      } catch (err) {
        logger.warn('Could not read .gitignore:', err);
      }

      // Detect common commit styles
      const commitStyleDetectors = [
        { 
          style: 'Conventional Commits', 
          detector: (msg: string) => /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/.test(msg) 
        },
        { 
          style: 'Angular Commits', 
          detector: (msg: string) => /^(build|ci|docs|feat|fix|perf|refactor|style|test)(\(.+\))?:/.test(msg) 
        }
      ];

      // Try to detect commit style from git log
      try {
        const gitLogOutput = await new Promise<string>((resolve, reject) => {
          const { exec } = require('child_process');
          exec('git log --pretty=format:"%s" -n 10', 
            { cwd: projectRoot }, 
            (err: any, stdout: string | PromiseLike<string>) => err ? reject(err) : resolve(stdout)
          );
        });

        const commitMessages = gitLogOutput.split('\n');
        context.commitStyles = commitStyleDetectors
          .filter(detector => 
            commitMessages.some(msg => detector.detector(msg))
          )
          .map(detector => detector.style);
      } catch (err) {
        logger.warn('Could not analyze git commit history:', err);
      }

      // Fallback commit styles if none detected
      if (context.commitStyles.length === 0) {
        context.commitStyles.push('Default');
      }

      return context;
    } catch (error) {
      logger.error('Project context analysis failed:', error);
      
      // Return a default context if analysis fails
      return {
        projectType: 'Unknown',
        mainLanguages: ['Unknown'],
        frameworksLibraries: [],
        commitStyles: ['Default'],
        ignoredPaths: []
      };
    }
  }

  /**
   * Generate a context-aware system prompt for AI
   * @param context Project context
   * @returns Tailored system prompt
   */
  static generateSystemPrompt(context: ProjectContext): string {
    const languagesStr = context.mainLanguages.join(', ');
    const frameworksStr = context.frameworksLibraries.join(', ');
    const commitStylesStr = context.commitStyles.join(', ');

    return `You are an expert software engineer generating commit messages for a ${context.projectType} project.

Project Context:
- Primary Languages: ${languagesStr}
- Frameworks/Libraries: ${frameworksStr}
- Commit Style Preference: ${commitStylesStr}

Commit Message Guidelines:
- Use imperative, present tense
- Be concise and specific
- Focus on the purpose and impact of changes
- Prioritize meaningful descriptions
- Adhere to project's commit message conventions`;
  }
}
