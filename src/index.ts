/**
 * AutoCoderDaily - Main Entry Point
 * 
 * Autonomous daily-code automation system that:
 * 1. Picks ONE programming task per day
 * 2. Generates a complete solution using AI
 * 3. Splits the solution into 5-10 meaningful commits
 * 4. Pushes each commit to GitHub with human-quality messages
 * 5. Runs tests before each commit
 */

import { logger } from './utils/logger.js';
import { selectDailyTask } from './taskSelector/index.js';
import { generateSolution } from './solutionGenerator/index.js';
import { splitSolution } from './splitter/index.js';
import { commitPipeline } from './committer/index.js';
import { archivePreviousMonth, shouldRunArchive, hasTasksToArchive } from './archiver/index.js';

const mainLogger = logger.child('Main');

/**
 * Run the daily automation pipeline
 */
export async function runDailyPipeline(options: { dryRun?: boolean } = {}): Promise<void> {
    const startTime = Date.now();
    mainLogger.startOperation('Daily Pipeline');

    try {
        // Step 1: Check if archiving should run (1st of month)
        if (shouldRunArchive()) {
            mainLogger.info('First of the month - checking for tasks to archive...');

            if (await hasTasksToArchive()) {
                mainLogger.info('Running monthly archive...');
                const archiveResult = await archivePreviousMonth();

                if (archiveResult.success) {
                    mainLogger.info(`Archived ${archiveResult.movedFolders} task folder(s)`);
                } else {
                    mainLogger.warn(`Archive failed: ${archiveResult.error}`);
                }
            }
        }

        // Step 2: Select today's task
        mainLogger.info('=== Step 1: Selecting Daily Task ===');
        const task = await selectDailyTask();
        mainLogger.info(`Selected: "${task.title}" (${task.difficulty})`);
        mainLogger.info(`Source: ${task.source}`);

        if (options.dryRun) {
            mainLogger.info('[DRY RUN] Task selected, stopping here');
            console.log('\n=== Selected Task ===');
            console.log(JSON.stringify(task, null, 2));
            return;
        }

        // Step 3: Generate solution
        mainLogger.info('=== Step 2: Generating Solution ===');
        const solution = await generateSolution(task);
        mainLogger.info('Solution generated successfully');
        mainLogger.info(`Approach: ${solution.explanation.slice(0, 100)}...`);

        // Step 4: Split solution into steps
        mainLogger.info('=== Step 3: Splitting Solution ===');
        const splitPlan = await splitSolution(task, solution);
        mainLogger.info(`Created ${splitPlan.totalSteps} solution steps`);

        // Step 5: Commit and push
        mainLogger.info('=== Step 4: Committing & Pushing ===');
        const pipelineResult = await commitPipeline(task, solution, splitPlan);

        // Summary
        const duration = Date.now() - startTime;
        mainLogger.info('');
        mainLogger.info('=== Pipeline Complete ===');
        mainLogger.info(`Duration: ${Math.round(duration / 1000)}s`);
        mainLogger.info(`Total commits: ${pipelineResult.totalCommits}`);
        mainLogger.info(`Successful: ${pipelineResult.successfulCommits}`);
        mainLogger.info(`Failed: ${pipelineResult.failedCommits}`);

        if (pipelineResult.errors.length > 0) {
            mainLogger.warn('Errors encountered:');
            pipelineResult.errors.forEach(err => mainLogger.warn(`  - ${err}`));
        }

        if (pipelineResult.success) {
            mainLogger.info('✓ Daily pipeline completed successfully!');
        } else {
            mainLogger.error('✗ Daily pipeline completed with errors');
            process.exitCode = 1;
        }

        mainLogger.endOperation('Daily Pipeline', duration);
    } catch (error) {
        mainLogger.failOperation('Daily Pipeline', error as Error);
        throw error;
    }
}

/**
 * Run archiving only
 */
export async function runArchive(): Promise<void> {
    mainLogger.startOperation('Archive Pipeline');

    try {
        const result = await archivePreviousMonth();

        if (result.success) {
            mainLogger.info(`Archive complete: ${result.movedFolders} folder(s) archived`);
            if (result.archivePath) {
                mainLogger.info(`Archive location: ${result.archivePath}`);
            }
        } else {
            mainLogger.error(`Archive failed: ${result.error}`);
            process.exitCode = 1;
        }

        mainLogger.endOperation('Archive Pipeline');
    } catch (error) {
        mainLogger.failOperation('Archive Pipeline', error as Error);
        throw error;
    }
}

// Run if executed directly
const isMainModule = import.meta.url.endsWith(process.argv[1]?.replace(/^file:\/\//, '') ?? '');
if (isMainModule) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    runDailyPipeline({ dryRun }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

// Export for testing
export { selectDailyTask, generateSolution, splitSolution, commitPipeline };
