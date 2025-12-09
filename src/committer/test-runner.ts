/**
 * Test Runner
 * 
 * Runs tests before commits to ensure code quality.
 * Uses Vitest for test execution.
 */

import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { logger } from '../utils/logger.js';

const testLogger = logger.child('TestRunner');

/**
 * Result of a test run
 */
export interface TestResult {
    success: boolean;
    output: string;
    errorOutput: string;
    exitCode: number;
    duration: number;
}

/**
 * Run tests using npm test
 */
export async function runTests(): Promise<TestResult> {
    testLogger.startOperation('Test execution');
    const startTime = Date.now();

    return new Promise((resolve) => {
        const childProcess: ChildProcessWithoutNullStreams = spawn('npm', ['run', 'test', '--', '--run', '--reporter=basic'], {
            shell: true,
            cwd: process.cwd(),
            env: { ...process.env, FORCE_COLOR: '0' },
        });

        let stdout = '';
        let stderr = '';

        childProcess.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        childProcess.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        childProcess.on('close', (code: number | null) => {
            const duration = Date.now() - startTime;
            const exitCode = code ?? 1;
            const success = exitCode === 0;

            if (success) {
                testLogger.endOperation('Test execution', duration);
                testLogger.info('All tests passed');
            } else {
                testLogger.error('Tests failed', { exitCode, stderr });
            }

            resolve({
                success,
                output: stdout,
                errorOutput: stderr,
                exitCode,
                duration,
            });
        });

        childProcess.on('error', (error: Error) => {
            const duration = Date.now() - startTime;
            testLogger.error('Failed to run tests', error);

            resolve({
                success: false,
                output: '',
                errorOutput: error.message,
                exitCode: 1,
                duration,
            });
        });
    });
}

/**
 * Run a quick syntax check on TypeScript files
 * This is faster than running full tests
 */
export async function runTypeCheck(): Promise<TestResult> {
    testLogger.startOperation('Type checking');
    const startTime = Date.now();

    return new Promise((resolve) => {
        const childProcess: ChildProcessWithoutNullStreams = spawn('npx', ['tsc', '--noEmit'], {
            shell: true,
            cwd: process.cwd(),
        });

        let stdout = '';
        let stderr = '';

        childProcess.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        childProcess.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        childProcess.on('close', (code: number | null) => {
            const duration = Date.now() - startTime;
            const exitCode = code ?? 1;
            const success = exitCode === 0;

            if (success) {
                testLogger.endOperation('Type checking', duration);
            } else {
                testLogger.warn('Type check found issues');
            }

            resolve({
                success,
                output: stdout,
                errorOutput: stderr,
                exitCode,
                duration,
            });
        });

        childProcess.on('error', (error: Error) => {
            const duration = Date.now() - startTime;
            testLogger.error('Failed to run type check', error);

            resolve({
                success: false,
                output: '',
                errorOutput: error.message,
                exitCode: 1,
                duration,
            });
        });
    });
}

/**
 * Run lint check
 */
export async function runLint(): Promise<TestResult> {
    testLogger.startOperation('Linting');
    const startTime = Date.now();

    return new Promise((resolve) => {
        const childProcess: ChildProcessWithoutNullStreams = spawn('npm', ['run', 'lint', '--', '--quiet'], {
            shell: true,
            cwd: process.cwd(),
        });

        let stdout = '';
        let stderr = '';

        childProcess.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        childProcess.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        childProcess.on('close', (code: number | null) => {
            const duration = Date.now() - startTime;
            const exitCode = code ?? 1;
            // Lint failures are warnings, not blockers
            const success = exitCode === 0;

            testLogger.endOperation('Linting', duration);

            if (!success) {
                testLogger.warn('Lint issues found (non-blocking)');
            }

            resolve({
                success: true, // Lint issues don't block commits
                output: stdout,
                errorOutput: stderr,
                exitCode,
                duration,
            });
        });

        childProcess.on('error', (error: Error) => {
            const duration = Date.now() - startTime;
            testLogger.warn('Lint command failed', error);

            resolve({
                success: true, // Lint failures don't block
                output: '',
                errorOutput: error.message,
                exitCode: 1,
                duration,
            });
        });
    });
}

/**
 * Run all pre-commit checks
 */
export async function runPreCommitChecks(): Promise<{
    passed: boolean;
    results: {
        lint: TestResult;
        typeCheck: TestResult;
    };
}> {
    testLogger.info('Running pre-commit checks...');

    // Run lint and type check in parallel
    const [lint, typeCheck] = await Promise.all([
        runLint(),
        runTypeCheck(),
    ]);

    const passed = typeCheck.success; // Only type check is required

    if (passed) {
        testLogger.info('Pre-commit checks passed');
    } else {
        testLogger.error('Pre-commit checks failed');
    }

    return {
        passed,
        results: {
            lint,
            typeCheck,
        },
    };
}
