/**
 * Solution Generator Module
 * 
 * Main entry point for solution generation.
 * Uses AI to generate complete, tested solutions for programming tasks.
 */

import { logger } from '../utils/logger.js';
import { generateSolutionWithAI } from './ai-solver.js';
import type { Task } from '../taskSelector/types.js';
import type { Solution } from './types.js';

const generatorLogger = logger.child('SolutionGenerator');

/**
 * Generate a complete solution for the given task
 * 
 * Uses AI to create a solution with:
 * - Working code
 * - Explanation of approach
 * - Complexity analysis
 * - Test cases
 */
export async function generateSolution(task: Task): Promise<Solution> {
    generatorLogger.startOperation(`Solution generation for "${task.title}"`);

    try {
        const solution = await generateSolutionWithAI(task);

        generatorLogger.info(`Solution generated successfully`);
        generatorLogger.info(`- Time Complexity: ${solution.timeComplexity}`);
        generatorLogger.info(`- Space Complexity: ${solution.spaceComplexity}`);
        generatorLogger.info(`- Test Cases: ${solution.testCases.length}`);

        generatorLogger.endOperation(`Solution generation for "${task.title}"`);

        return solution;
    } catch (error) {
        generatorLogger.failOperation(`Solution generation for "${task.title}"`, error as Error);
        throw error;
    }
}

// Re-export types
export type { Solution, TestCase } from './types.js';
