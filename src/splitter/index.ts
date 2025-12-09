/**
 * Solution Splitter Module
 * 
 * Splits a complete solution into 5-10 incremental steps.
 * Uses AI to intelligently break down the solution into meaningful commits.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config, getRandomStepCount } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { Task } from '../taskSelector/types.js';
import type { Solution } from '../solutionGenerator/types.js';
import type { SolutionStep, SplitPlan } from './types.js';

const splitterLogger = logger.child('Splitter');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Commit message templates for different step types
 */
const COMMIT_TEMPLATES = {
    init: [
        'Initialize solution scaffolding for today\'s problem',
        'Set up initial structure for the solution',
        'Add problem description and empty solution template',
    ],
    types: [
        'Define types and interfaces',
        'Add TypeScript types for the solution',
        'Create type definitions for input/output',
    ],
    helper: [
        'Add helper functions',
        'Implement utility functions for the solution',
        'Create helper methods for data processing',
    ],
    core: [
        'Implement core algorithm logic',
        'Add main solution function',
        'Implement the primary algorithm',
    ],
    optimization: [
        'Optimize time complexity',
        'Improve space efficiency',
        'Refactor for better performance',
    ],
    edge: [
        'Handle edge cases',
        'Add boundary condition checks',
        'Implement error handling for edge cases',
    ],
    test: [
        'Add test cases',
        'Implement test suite for the solution',
        'Add comprehensive tests with edge cases',
    ],
    final: [
        'Finalize solution with documentation',
        'Complete implementation with full documentation',
        'Polish final solution code',
    ],
};

/**
 * Get a random commit message from a template category
 */
function getCommitMessage(category: keyof typeof COMMIT_TEMPLATES): string {
    const templates = COMMIT_TEMPLATES[category];
    const index = Math.floor(Math.random() * templates.length);
    return templates[index] ?? templates[0] ?? 'Update solution';
}

/**
 * Split a solution into incremental steps using AI
 */
export async function splitSolution(
    task: Task,
    solution: Solution
): Promise<SplitPlan> {
    splitterLogger.startOperation('Solution splitting');

    const stepCount = getRandomStepCount();
    splitterLogger.info(`Splitting solution into ${stepCount} steps`);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an expert at breaking down code into logical, incremental commits.

Given the following complete solution, split it into exactly ${stepCount} logical steps that build upon each other.

## Task
Title: ${task.title}
Difficulty: ${task.difficulty}

## Complete Solution
\`\`\`typescript
${solution.code}
\`\`\`

## Instructions
Split this solution into ${stepCount} steps. Each step should:
1. Build on the previous step
2. Be a logical, meaningful unit of work
3. Represent how a human developer would incrementally build the solution
4. Have compilable code (even if incomplete)

Format your response as JSON with this exact structure:
\`\`\`json
{
  "steps": [
    {
      "stepNumber": 1,
      "name": "Step name (2-4 words)",
      "description": "What this step accomplishes",
      "code": "// The TypeScript code for this step\\n...",
      "category": "init|types|helper|core|optimization|edge|test|final"
    },
    // ... more steps
  ]
}
\`\`\`

Important:
- Step 1 should set up the initial structure
- The final step should contain the complete solution
- Each intermediate step should be a working (though incomplete) version
- Use realistic TypeScript code`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        if (!response) {
            throw new Error('Empty response from AI');
        }

        const plan = parseStepsFromResponse(response, task.id, stepCount);

        splitterLogger.endOperation('Solution splitting');
        splitterLogger.info(`Created ${plan.steps.length} solution steps`);

        return plan;
    } catch (error) {
        splitterLogger.warn('AI splitting failed, using fallback method');
        return createFallbackPlan(task, solution, stepCount);
    }
}

/**
 * Parse the AI response into a SplitPlan
 */
function parseStepsFromResponse(
    response: string,
    taskId: string,
    expectedSteps: number
): SplitPlan {
    // Extract JSON from the response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)```/i);

    if (!jsonMatch?.[1]) {
        throw new Error('Could not extract JSON from AI response');
    }

    const data = JSON.parse(jsonMatch[1]) as {
        steps: Array<{
            stepNumber: number;
            name: string;
            description: string;
            code: string;
            category?: string;
        }>;
    };

    if (!data.steps || !Array.isArray(data.steps)) {
        throw new Error('Invalid step data from AI');
    }

    const steps: SolutionStep[] = data.steps.map((step, index) => {
        const category = (step.category ?? 'core') as keyof typeof COMMIT_TEMPLATES;
        const commitMessage = getCommitMessage(
            COMMIT_TEMPLATES[category] ? category : 'core'
        );

        return {
            stepNumber: index + 1,
            name: step.name,
            description: step.description,
            code: step.code,
            commitMessage,
            files: [], // Will be filled in when files are written
        };
    });

    return {
        taskId,
        totalSteps: steps.length,
        steps,
    };
}

/**
 * Create a fallback plan when AI splitting fails
 * Uses a simple line-based splitting approach
 */
function createFallbackPlan(
    task: Task,
    solution: Solution,
    stepCount: number
): SplitPlan {
    splitterLogger.info('Using fallback splitting method');

    const lines = solution.code.split('\n');
    const linesPerStep = Math.ceil(lines.length / stepCount);

    const steps: SolutionStep[] = [];

    for (let i = 0; i < stepCount; i++) {
        const startLine = i * linesPerStep;
        const endLine = Math.min((i + 1) * linesPerStep, lines.length);
        const stepLines = lines.slice(0, endLine);

        const isFirst = i === 0;
        const isLast = i === stepCount - 1;

        let category: keyof typeof COMMIT_TEMPLATES;
        if (isFirst) category = 'init';
        else if (isLast) category = 'final';
        else if (i === 1) category = 'types';
        else if (i === stepCount - 2) category = 'test';
        else category = 'core';

        steps.push({
            stepNumber: i + 1,
            name: isFirst
                ? 'Initialize solution'
                : isLast
                    ? 'Complete solution'
                    : `Implement part ${i}`,
            description: `Lines ${startLine + 1} to ${endLine} of the solution`,
            code: stepLines.join('\n'),
            commitMessage: getCommitMessage(category),
            files: [],
        });
    }

    return {
        taskId: task.id,
        totalSteps: steps.length,
        steps,
    };
}

// Re-export types
export type { SolutionStep, SplitPlan } from './types.js';
