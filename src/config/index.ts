/**
 * Configuration Module
 * 
 * Loads and validates environment variables using Zod.
 * Provides type-safe access to all configuration values.
 */

import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenvConfig();

/**
 * Configuration schema with validation
 */
const ConfigSchema = z.object({
    // Required API Keys
    geminiApiKey: z.string().min(1, 'GEMINI_API_KEY is required'),
    githubToken: z.string().min(1, 'GITHUB_TOKEN is required'),
    githubRepo: z.string().regex(/^[\w-]+\/[\w-]+$/, 'GITHUB_REPO must be in owner/repo format'),

    // Git user configuration
    gitUserName: z.string().min(1, 'GIT_USER_NAME is required'),
    gitUserEmail: z.string().email('GIT_USER_EMAIL must be a valid email'),

    // Task sources configuration
    taskSources: z.array(z.enum(['leetcode', 'stackoverflow', 'github', 'ai'])).min(1),

    // Commit delay configuration (in milliseconds)
    minCommitDelay: z.number().min(10000).max(600000),
    maxCommitDelay: z.number().min(10000).max(600000),

    // Solution steps configuration
    minSolutionSteps: z.number().min(3).max(15),
    maxSolutionSteps: z.number().min(3).max(15),

    // Paths
    tasksDir: z.string(),
    archiveDir: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Parse and validate configuration from environment variables
 */
function loadConfig(): Config {
    const rawConfig = {
        geminiApiKey: process.env['GEMINI_API_KEY'] ?? '',
        githubToken: process.env['GITHUB_TOKEN'] ?? '',
        githubRepo: process.env['GITHUB_REPO'] ?? '',
        gitUserName: process.env['GIT_USER_NAME'] ?? 'AutoCoderDaily Bot',
        gitUserEmail: process.env['GIT_USER_EMAIL'] ?? 'bot@autocoderdaily.dev',
        taskSources: (process.env['TASK_SOURCES'] ?? 'leetcode,stackoverflow,ai')
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0),
        minCommitDelay: parseInt(process.env['MIN_COMMIT_DELAY'] ?? '60000', 10),
        maxCommitDelay: parseInt(process.env['MAX_COMMIT_DELAY'] ?? '180000', 10),
        minSolutionSteps: parseInt(process.env['MIN_SOLUTION_STEPS'] ?? '5', 10),
        maxSolutionSteps: parseInt(process.env['MAX_SOLUTION_STEPS'] ?? '10', 10),
        tasksDir: './tasks',
        archiveDir: './archive',
    };

    const result = ConfigSchema.safeParse(rawConfig);

    if (!result.success) {
        console.error('Configuration validation failed:');
        result.error.errors.forEach(err => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        throw new Error('Invalid configuration. Please check your .env file.');
    }

    // Validate that maxCommitDelay >= minCommitDelay
    if (result.data.maxCommitDelay < result.data.minCommitDelay) {
        throw new Error('MAX_COMMIT_DELAY must be greater than or equal to MIN_COMMIT_DELAY');
    }

    // Validate that maxSolutionSteps >= minSolutionSteps
    if (result.data.maxSolutionSteps < result.data.minSolutionSteps) {
        throw new Error('MAX_SOLUTION_STEPS must be greater than or equal to MIN_SOLUTION_STEPS');
    }

    return result.data;
}

// Export singleton config instance
export const config = loadConfig();

/**
 * Get a random number of solution steps within configured range
 */
export function getRandomStepCount(): number {
    return Math.floor(
        Math.random() * (config.maxSolutionSteps - config.minSolutionSteps + 1)
    ) + config.minSolutionSteps;
}

/**
 * Get a random delay within configured range
 */
export function getRandomDelay(): number {
    return Math.floor(
        Math.random() * (config.maxCommitDelay - config.minCommitDelay)
    ) + config.minCommitDelay;
}
