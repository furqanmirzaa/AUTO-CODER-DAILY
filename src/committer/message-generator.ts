/**
 * Commit Message Generator
 * 
 * Generates meaningful, human-quality commit messages.
 * Uses templates and context to create varied messages.
 */

import { logger } from '../utils/logger.js';
import type { SolutionStep } from '../splitter/types.js';

const messageLogger = logger.child('MessageGenerator');

/**
 * Prefix phrases for variety
 */
const PREFIXES = [
    '',
    'feat: ',
    'impl: ',
    'add: ',
    'refactor: ',
    'improve: ',
];

/**
 * Action verbs for commit messages
 */
const VERBS = {
    init: ['Initialize', 'Set up', 'Create', 'Add', 'Start'],
    implement: ['Implement', 'Add', 'Create', 'Build', 'Develop'],
    update: ['Update', 'Modify', 'Adjust', 'Refine', 'Improve'],
    fix: ['Fix', 'Correct', 'Resolve', 'Address', 'Handle'],
    complete: ['Complete', 'Finalize', 'Finish', 'Polish', 'Wrap up'],
    test: ['Add', 'Implement', 'Create', 'Write', 'Include'],
};

/**
 * Get a random element from an array
 */
function randomElement<T>(arr: T[]): T {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index] as T;
}

/**
 * Generate a commit message for a step
 */
export function generateCommitMessage(
    step: SolutionStep,
    taskTitle: string,
    isFirst: boolean,
    isLast: boolean
): string {
    // Use step's commit message if available and good
    if (step.commitMessage && step.commitMessage.length > 10) {
        messageLogger.debug(`Using step commit message: ${step.commitMessage}`);
        return step.commitMessage;
    }

    // Generate based on position
    let message: string;

    if (isFirst) {
        const verb = randomElement(VERBS.init);
        message = `${verb} solution scaffolding for ${taskTitle}`;
    } else if (isLast) {
        const verb = randomElement(VERBS.complete);
        message = `${verb} solution implementation`;
    } else {
        // Use step name and description
        const verb = randomElement(VERBS.implement);
        message = `${verb} ${step.name.toLowerCase()}`;
    }

    // Maybe add a prefix (30% chance)
    if (Math.random() < 0.3) {
        const prefix = randomElement(PREFIXES.filter(p => p !== ''));
        message = `${prefix}${message}`;
    }

    messageLogger.debug(`Generated commit message: ${message}`);
    return message;
}

/**
 * Generate a commit message for the problem description file
 */
export function generateProblemCommitMessage(taskTitle: string): string {
    const options = [
        `Add problem description: ${taskTitle}`,
        `Initialize today's challenge: ${taskTitle}`,
        `Start new problem: ${taskTitle}`,
        `Add challenge for today: ${taskTitle}`,
    ];
    return randomElement(options);
}

/**
 * Generate a commit message for the test file
 */
export function generateTestCommitMessage(): string {
    const options = [
        'Add comprehensive test suite',
        'Implement tests for edge cases',
        'Add unit tests for solution',
        'Create test cases for validation',
        'Add full test coverage',
    ];
    return randomElement(options);
}

/**
 * Generate a commit message for the final solution
 */
export function generateFinalCommitMessage(): string {
    const options = [
        'Finalize solution with all optimizations',
        'Complete implementation with documentation',
        'Polish final solution code',
        'Conclude today\'s challenge implementation',
        'Final solution with full test coverage',
    ];
    return randomElement(options);
}

/**
 * Validate a commit message meets standards
 */
export function isValidCommitMessage(message: string): boolean {
    // Check minimum length
    if (message.length < 10) return false;

    // Check maximum length
    if (message.length > 100) return false;

    // Check it doesn't start with lowercase (unless it's a conventional commit prefix)
    if (/^[a-z]/.test(message) && !message.includes(':')) return false;

    return true;
}
