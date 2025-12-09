/**
 * Task Selector Module
 * 
 * Main entry point for task selection.
 * Rotates between different task sources based on configuration.
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { leetcodeFetcher } from './leetcode.js';
import { stackoverflowFetcher } from './stackoverflow.js';
import { githubFetcher } from './github-issues.js';
import { aiChallengeFetcher } from './ai-challenge.js';
import type { Task, TaskFetcher, TaskSource } from './types.js';

const selectorLogger = logger.child('TaskSelector');

/**
 * Map of available task fetchers
 */
const fetchers: Record<TaskSource, TaskFetcher> = {
    leetcode: leetcodeFetcher,
    stackoverflow: stackoverflowFetcher,
    github: githubFetcher,
    ai: aiChallengeFetcher,
};

/**
 * Get the enabled fetchers based on configuration
 */
function getEnabledFetchers(): TaskFetcher[] {
    return config.taskSources
        .map(source => fetchers[source])
        .filter((fetcher): fetcher is TaskFetcher => fetcher !== undefined);
}

/**
 * Select a task source for today using date-based rotation
 * This ensures variety while being deterministic for the same day
 */
function selectSourceForToday(enabledFetchers: TaskFetcher[]): TaskFetcher {
    const today = new Date();
    const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );

    const index = dayOfYear % enabledFetchers.length;
    const fetcher = enabledFetchers[index];

    if (!fetcher) {
        throw new Error('No fetcher available for today');
    }

    return fetcher;
}

/**
 * Try to fetch a task from the given fetcher with fallback support
 */
async function tryFetchWithFallback(
    primaryFetcher: TaskFetcher,
    allFetchers: TaskFetcher[]
): Promise<Task> {
    // Try primary fetcher first
    try {
        selectorLogger.info(`Trying primary source: ${primaryFetcher.name}`);

        const isAvailable = await primaryFetcher.isAvailable();
        if (isAvailable) {
            return await primaryFetcher.fetchTask();
        }

        selectorLogger.warn(`${primaryFetcher.name} is not available, trying fallbacks...`);
    } catch (error) {
        selectorLogger.warn(`Failed to fetch from ${primaryFetcher.name}`, error);
    }

    // Try fallback fetchers
    for (const fetcher of allFetchers) {
        if (fetcher.name === primaryFetcher.name) continue;

        try {
            selectorLogger.info(`Trying fallback source: ${fetcher.name}`);

            const isAvailable = await fetcher.isAvailable();
            if (isAvailable) {
                return await fetcher.fetchTask();
            }
        } catch (error) {
            selectorLogger.warn(`Failed to fetch from ${fetcher.name}`, error);
        }
    }

    throw new Error('All task sources failed. Unable to select a task for today.');
}

/**
 * Select a programming task for today
 * 
 * Uses date-based rotation to select a source, with fallback support
 * if the primary source is unavailable.
 */
export async function selectDailyTask(): Promise<Task> {
    selectorLogger.startOperation('Daily task selection');

    const enabledFetchers = getEnabledFetchers();

    if (enabledFetchers.length === 0) {
        throw new Error('No task sources are enabled. Check TASK_SOURCES in your .env file.');
    }

    selectorLogger.info(`Enabled sources: ${enabledFetchers.map(f => f.name).join(', ')}`);

    const primaryFetcher = selectSourceForToday(enabledFetchers);
    selectorLogger.info(`Primary source for today: ${primaryFetcher.name}`);

    const task = await tryFetchWithFallback(primaryFetcher, enabledFetchers);

    selectorLogger.endOperation('Daily task selection');
    selectorLogger.info(`Selected task: "${task.title}" from ${task.source}`);

    return task;
}

/**
 * Get a specific fetcher by source name
 */
export function getFetcher(source: TaskSource): TaskFetcher | undefined {
    return fetchers[source];
}

// Re-export types
export type { Task, TaskSource, TaskDifficulty, TaskFetcher } from './types.js';
