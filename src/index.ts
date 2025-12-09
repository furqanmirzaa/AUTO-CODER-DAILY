/**
 * Daily Coding Challenge
 *
 * Automatically generates and solves a coding problem daily
 * using Google's Gemini AI, then commits it to GitHub.
 */

import { GoogleGenAI } from '@google/genai';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';

import { Problem, DailyChallengeResult } from './types';
import { config, validateConfig } from './config';
import { PROMPTS } from './prompts';
import { getDateString, getFormattedDate, cleanMarkdown, extractJSON, log, getRandomStages, sleep } from './utils';




// ─────────────────────────────────────────────────────────────────
// Main Class
// ─────────────────────────────────────────────────────────────────

class DailyCodingChallenge {
    private ai: GoogleGenAI;
    private git: SimpleGit;

    constructor() {
        validateConfig();
        this.ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        this.git = simpleGit();
    }

    // ─────────────────────────────────────────────────────────────────
    // Problem Generation
    // ─────────────────────────────────────────────────────────────────

    async generateProblem(): Promise<Problem> {
        log.info('Generating coding problem...');

        try {
            const response = await this.ai.models.generateContent({
                model: config.geminiModel,
                contents: PROMPTS.generateProblem,
            });

            const text = response.text;
            const problem = text ? extractJSON<Problem>(text) : null;

            if (problem) {
                log.success(`Generated: ${problem.title}`);
                return problem;
            }

            return {
                title: 'Daily Coding Challenge',
                description: text || 'No description available',
                examples: 'See description',
                difficulty: 'Medium',
            };
        } catch (error) {
            log.error('Error generating problem');
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Solution Generation
    // ─────────────────────────────────────────────────────────────────

    async solveProblemStage(problem: Problem, stage: number, totalStages: number): Promise<{ code: string; commitMessage: string }> {
        log.ai('Generating solution...');

        try {
            const prompt = PROMPTS.solveProblemStage(
                problem.title,
                problem.description,
                problem.examples,
                problem.constraints,
                stage,
                totalStages
            );

            const result = await this.ai.models.generateContent({
                model: config.geminiModel,
                contents: prompt,
            });

            return extractJSON<{ code: string; commitMessage: string }>(result?.text ?? '') || { code: '', commitMessage: '' };
        } catch (error) {
            log.error('Error generating solution');
            throw error;
        }
    }


    // Save initial file with problem info
    saveFileHeader(problem: Problem): string {
        const dateStr = getDateString();
        const year = new Date().getFullYear().toString();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

        const dirPath = path.join('challenges', year, month);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

        const filename = path.join(dirPath, `${dateStr}.ts`);
        const content = `/**
 * Daily Coding Challenge: ${dateStr}
 * Problem: ${problem.title}
 *
 * Description:
 * ${problem.description}
 *
 * Examples:
 * ${problem.examples}
 * ${problem.constraints ? `\n * Constraints:\n * ${problem.constraints}` : ''}
 *
 * Difficulty: ${problem.difficulty || 'Medium'}
 */
`;

        fs.writeFileSync(filename, content, 'utf-8');
        return filename;
    }

    // Commit a file stage
    async commitStage(filename: string, commitMessage: string) {
        await this.git.add(filename);
        await this.git.commit(commitMessage);
    }

    // Push to GitHub
    async pushToGitHub() {
        await this.git.push('origin', 'main');
    }

    // ─────────────────────────────────────────────────────────────────
    // File Operations
    // ─────────────────────────────────────────────────────────────────

    async saveToFile(problem: Problem, solution: string): Promise<{ filename: string; title: string }> {
        log.file('Creating solution file...');

        const dateStr = getDateString();
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');

        // Create directory: challenges/YYYY/MM/
        const dirPath = path.join('challenges', year, month);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filename = path.join(dirPath, `${dateStr}.ts`);
        const content = this.formatFileContent(problem, solution, dateStr);

        fs.writeFileSync(filename, content, 'utf-8');
        log.success(`Created: ${filename}`);

        return { filename, title: problem.title };
    }



    private formatFileContent(problem: Problem, solution: string, dateStr: string): string {
        return `/**
 * Daily Coding Challenge: ${dateStr}
 * Problem: ${problem.title}
 * 
 * Description:
 * ${problem.description}
 * 
 * Examples:
 * ${problem.examples}
 * ${problem.constraints ? `\n * Constraints:\n * ${problem.constraints}` : ''}
 * 
 * Difficulty: ${problem.difficulty || 'Medium'}
 */

${solution}

// Run the solution
console.log('Running daily challenge solution...');
`;
    }



    // ─────────────────────────────────────────────────────────────────
    // Main Workflow
    // ─────────────────────────────────────────────────────────────────

    // Main workflow
    async run(): Promise<DailyChallengeResult> {
        console.log('🚀 Starting Daily Coding Challenge...');
        const problem = await this.generateProblem();
        const filename = this.saveFileHeader(problem);
        const dateStr = getDateString();

        const totalStages = getRandomStages();
        console.log(`💡 Total stages for this problem: ${totalStages}`);
        let solution = '';
        for (let stage = 1; stage <= totalStages; stage++) {
            console.log(`🛠 Generating stage ${stage}...`);
            const { code, commitMessage } = await this.solveProblemStage(problem, stage, totalStages);
            solution = code
            // Overwrite the entire file
            fs.writeFileSync(filename, `\n// ── Stage ${stage} ──\n${code}\n`, 'utf-8');

            // Commit stage
            await this.commitStage(filename, commitMessage);
            console.log(`✅ Committed stage ${stage}`);

            // Random delay 1–3 minutes
            const delayMs = Math.floor(Math.random() * 120_000) + 60_000;
            console.log(`⏱ Waiting ${Math.floor(delayMs / 1000)}s before next stage...`);
            // await sleep(delayMs);
        }

        const content = this.formatFileContent(problem, solution, dateStr);
        fs.writeFileSync(filename, content, 'utf-8');

        // Push all stages at the end
        await this.pushToGitHub();
        console.log('🎉 All stages pushed to GitHub!');

        return { filename, problemTitle: problem.title, success: true };
    }
}

// ─────────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    try {
        const challenge = new DailyCodingChallenge();
        await challenge.run();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export default DailyCodingChallenge;
export { Problem, DailyChallengeResult };