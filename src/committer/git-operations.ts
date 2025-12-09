/**
 * Git Operations
 * 
 * Wrapper around simple-git for Git operations.
 * Provides type-safe, logged git commands.
 */

import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const gitLogger = logger.child('Git');

/**
 * Git configuration options
 */
const gitOptions: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 1,
    trimmed: true,
};

/**
 * Initialize the git instance
 */
let git: SimpleGit | null = null;

/**
 * Get or initialize the git instance
 */
export function getGit(): SimpleGit {
    if (!git) {
        git = simpleGit(gitOptions);
        gitLogger.debug('Git instance initialized');
    }
    return git;
}

/**
 * Configure git with user info
 */
export async function configureGit(): Promise<void> {
    const g = getGit();

    await g.addConfig('user.name', config.gitUserName);
    await g.addConfig('user.email', config.gitUserEmail);

    gitLogger.info(`Git configured: ${config.gitUserName} <${config.gitUserEmail}>`);
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
    const g = getGit();
    const status = await g.status();
    return status.staged.length > 0;
}

/**
 * Check if there are any changes (staged or unstaged)
 */
export async function hasChanges(): Promise<boolean> {
    const g = getGit();
    const status = await g.status();
    return !status.isClean();
}

/**
 * Stage specific files for commit
 */
export async function stageFiles(files: string[]): Promise<void> {
    const g = getGit();

    for (const file of files) {
        await g.add(file);
        gitLogger.debug(`Staged: ${file}`);
    }

    gitLogger.info(`Staged ${files.length} file(s)`);
}

/**
 * Stage all changes in the tasks directory
 */
export async function stageTasksDir(): Promise<void> {
    const g = getGit();
    await g.add(config.tasksDir);
    gitLogger.info(`Staged all changes in ${config.tasksDir}`);
}

/**
 * Create a commit with the given message
 */
export async function commit(message: string): Promise<string> {
    const g = getGit();

    // Check if there are staged changes
    const staged = await hasStagedChanges();
    if (!staged) {
        gitLogger.warn('No staged changes to commit');
        return '';
    }

    const result = await g.commit(message);
    const commitHash = result.commit || 'unknown';

    gitLogger.info(`Created commit: ${commitHash}`);
    gitLogger.debug(`Commit message: ${message}`);

    return commitHash;
}

/**
 * Push commits to the remote repository
 */
export async function push(branch: string = 'main'): Promise<void> {
    const g = getGit();

    gitLogger.info(`Pushing to origin/${branch}...`);

    try {
        await g.push('origin', branch);
        gitLogger.info('Push successful');
    } catch (error) {
        gitLogger.error('Push failed', error);
        throw error;
    }
}

/**
 * Get the current branch name
 */
export async function getCurrentBranch(): Promise<string> {
    const g = getGit();
    const branch = await g.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
}

/**
 * Get the latest commit hash
 */
export async function getLatestCommitHash(): Promise<string> {
    const g = getGit();
    const hash = await g.revparse(['HEAD']);
    return hash.trim();
}

/**
 * Check if the repository is in a clean state
 */
export async function isClean(): Promise<boolean> {
    const g = getGit();
    const status = await g.status();
    return status.isClean();
}

/**
 * Get the current git status
 */
export async function getStatus(): Promise<{
    staged: string[];
    modified: string[];
    untracked: string[];
    isClean: boolean;
}> {
    const g = getGit();
    const status = await g.status();

    return {
        staged: status.staged,
        modified: status.modified,
        untracked: status.not_added,
        isClean: status.isClean(),
    };
}

/**
 * Ensure we're on the correct branch
 */
export async function ensureBranch(branch: string = 'main'): Promise<void> {
    const g = getGit();
    const currentBranch = await getCurrentBranch();

    if (currentBranch !== branch) {
        gitLogger.info(`Switching from ${currentBranch} to ${branch}`);
        await g.checkout(branch);
    }
}

/**
 * Pull latest changes from remote
 */
export async function pull(branch: string = 'main'): Promise<void> {
    const g = getGit();

    gitLogger.info(`Pulling from origin/${branch}...`);

    try {
        await g.pull('origin', branch, { '--rebase': 'false' });
        gitLogger.info('Pull successful');
    } catch (error) {
        gitLogger.error('Pull failed', error);
        throw error;
    }
}
