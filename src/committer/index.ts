/**
 * Committer Module
 * 
 * Orchestrates the commit workflow:
 * 1. Write solution step files
 * 2. Run tests/checks
 * 3. Commit changes
 * 4. Push to remote
 */

import { logger } from '../utils/logger.js';
import { randomDelay } from '../utils/delay.js';
import {
    writeProblemFile,
    writeSolutionStepFile,
    writeFinalSolutionFile,
    writeTestFile,
    getTodayDateString,
} from '../utils/file-writer.js';
import {
    configureGit,
    stageFiles,
    commit,
    push,
    ensureBranch,
    pull,
    hasStagedChanges,
} from './git-operations.js';
import {
    generateCommitMessage,
    generateProblemCommitMessage,
    generateTestCommitMessage,
    generateFinalCommitMessage,
} from './message-generator.js';
import { runPreCommitChecks } from './test-runner.js';
import type { Task } from '../taskSelector/types.js';
import type { Solution } from '../solutionGenerator/types.js';
import type { SplitPlan, SolutionStep } from '../splitter/types.js';

const committerLogger = logger.child('Committer');

/**
 * Maximum retry attempts for failed commits
 */
const MAX_RETRY_ATTEMPTS = 2;

/**
 * Result of a commit operation
 */
export interface CommitResult {
    success: boolean;
    commitHash?: string;
    error?: string;
}

/**
 * Result of the full commit pipeline
 */
export interface PipelineResult {
    success: boolean;
    totalCommits: number;
    successfulCommits: number;
    failedCommits: number;
    errors: string[];
}

/**
 * Execute a single commit with retry logic
 */
async function executeCommit(
    files: string[],
    message: string,
    retryCount: number = 0
): Promise<CommitResult> {
    try {
        // Stage the files
        await stageFiles(files);

        // Check if there are actually staged changes
        if (!(await hasStagedChanges())) {
            committerLogger.warn('No changes to commit, skipping');
            return { success: true };
        }

        // Create the commit
        const commitHash = await commit(message);

        // Push immediately
        await push();

        return { success: true, commitHash };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        committerLogger.error(`Commit failed: ${errorMessage}`);

        // Retry if we haven't exceeded max attempts
        if (retryCount < MAX_RETRY_ATTEMPTS) {
            committerLogger.info(`Retrying commit (attempt ${retryCount + 2}/${MAX_RETRY_ATTEMPTS + 1})...`);
            await randomDelay();
            return executeCommit(files, message, retryCount + 1);
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Execute the full commit pipeline for a task
 */
export async function commitPipeline(
    task: Task,
    solution: Solution,
    splitPlan: SplitPlan
): Promise<PipelineResult> {
    committerLogger.startOperation('Commit pipeline');

    const result: PipelineResult = {
        success: true,
        totalCommits: 0,
        successfulCommits: 0,
        failedCommits: 0,
        errors: [],
    };

    const dateString = getTodayDateString();

    try {
        // Configure git
        await configureGit();

        // Ensure we're on the correct branch
        await ensureBranch();

        // Pull latest changes
        try {
            await pull();
        } catch {
            committerLogger.warn('Pull failed, continuing anyway');
        }

        // Step 1: Commit problem description
        committerLogger.info('Step 1: Committing problem description...');
        const problemFile = await writeProblemFile(task, dateString);
        const problemMessage = generateProblemCommitMessage(task.title);
        const problemResult = await executeCommit([problemFile], problemMessage);
        result.totalCommits++;
        if (problemResult.success) {
            result.successfulCommits++;
        } else {
            result.failedCommits++;
            result.errors.push(problemResult.error ?? 'Problem commit failed');
        }

        // Add delay before next commit
        await randomDelay();

        // Step 2-N: Commit each solution step
        for (let i = 0; i < splitPlan.steps.length; i++) {
            const step = splitPlan.steps[i] as SolutionStep;
            const isFirst = i === 0;
            const isLast = i === splitPlan.steps.length - 1;

            committerLogger.info(`Step ${i + 2}: Committing "${step.name}"...`);

            // Write the step file
            const stepFile = await writeSolutionStepFile(step, i + 1, dateString);
            step.files.push(stepFile);

            // Generate commit message
            const message = generateCommitMessage(step, task.title, isFirst, isLast);

            // Run pre-commit checks (only for last few steps)
            if (i >= splitPlan.steps.length - 2) {
                const checks = await runPreCommitChecks();
                if (!checks.passed) {
                    committerLogger.warn('Pre-commit checks failed, skipping remaining commits');
                    result.errors.push('Pre-commit checks failed');
                    break;
                }
            }

            // Execute the commit
            const stepResult = await executeCommit(step.files, message);
            result.totalCommits++;
            if (stepResult.success) {
                result.successfulCommits++;
            } else {
                result.failedCommits++;
                result.errors.push(stepResult.error ?? `Step ${i + 1} commit failed`);
                // Continue with next step even if this one failed
            }

            // Add delay before next commit (except for last)
            if (!isLast) {
                await randomDelay();
            }
        }

        // Final step: Commit test file and final solution
        committerLogger.info('Final: Committing tests and final solution...');

        const testFile = await writeTestFile(solution.testCode, dateString);
        const finalFile = await writeFinalSolutionFile(solution.code, dateString);

        const testMessage = generateTestCommitMessage();
        await executeCommit([testFile], testMessage);
        result.totalCommits++;
        result.successfulCommits++;

        await randomDelay();

        const finalMessage = generateFinalCommitMessage();
        await executeCommit([finalFile], finalMessage);
        result.totalCommits++;
        result.successfulCommits++;

        // Determine overall success
        result.success = result.failedCommits === 0;

        committerLogger.endOperation('Commit pipeline');
        committerLogger.info(
            `Pipeline complete: ${result.successfulCommits}/${result.totalCommits} commits successful`
        );

        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        committerLogger.failOperation('Commit pipeline', error as Error);
        result.success = false;
        result.errors.push(errorMessage);
        return result;
    }
}

