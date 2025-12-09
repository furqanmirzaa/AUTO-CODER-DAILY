/**
 * Archiver Module
 * 
 * Handles monthly archiving of task folders.
 * Moves previous month's tasks to /archive/YYYY-MM/ directory.
 */

import * as path from 'path';
import { logger } from '../utils/logger.js';
import {
    getTaskFoldersForMonth,
    moveFolder,
    getArchivePath,
    ensureDirectory,
    directoryExists,
} from './file-mover.js';
import {
    configureGit,
    stageFiles,
    commit,
    push,
    ensureBranch,
    getStatus,
} from '../committer/git-operations.js';
import { config } from '../config/index.js';

const archiverLogger = logger.child('Archiver');

/**
 * Result of an archive operation
 */
export interface ArchiveResult {
    success: boolean;
    movedFolders: number;
    archivePath?: string;
    error?: string;
}

/**
 * Get the previous month (year, month)
 */
function getPreviousMonth(): { year: number; month: number } {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
        year: prevMonth.getFullYear(),
        month: prevMonth.getMonth() + 1, // Convert from 0-indexed
    };
}

/**
 * Archive the previous month's tasks
 * Should be run on the 1st of every month
 */
export async function archivePreviousMonth(): Promise<ArchiveResult> {
    const { year, month } = getPreviousMonth();
    return archiveMonth(year, month);
}

/**
 * Archive a specific month's tasks
 */
export async function archiveMonth(year: number, month: number): Promise<ArchiveResult> {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    archiverLogger.startOperation(`Archiving month: ${monthStr}`);

    try {
        // Get all task folders for the month
        const folders = await getTaskFoldersForMonth(year, month);

        if (folders.length === 0) {
            archiverLogger.info(`No folders found for ${monthStr}`);
            return {
                success: true,
                movedFolders: 0,
            };
        }

        archiverLogger.info(`Found ${folders.length} folders to archive`);

        // Get archive destination path
        const archivePath = getArchivePath(year, month);
        await ensureDirectory(archivePath);

        // Move each folder
        for (const folder of folders) {
            const folderName = path.basename(folder);
            const destination = path.join(archivePath, folderName);

            archiverLogger.debug(`Archiving: ${folderName}`);
            await moveFolder(folder, destination);
        }

        archiverLogger.info(`Moved ${folders.length} folders to ${archivePath}`);

        // Commit the archive
        await commitArchive(folders.length, monthStr);

        archiverLogger.endOperation(`Archiving month: ${monthStr}`);

        return {
            success: true,
            movedFolders: folders.length,
            archivePath,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        archiverLogger.failOperation(`Archiving month: ${monthStr}`, error as Error);

        return {
            success: false,
            movedFolders: 0,
            error: errorMessage,
        };
    }
}

/**
 * Commit the archive changes
 */
async function commitArchive(folderCount: number, monthStr: string): Promise<void> {
    archiverLogger.info('Committing archive changes...');

    try {
        await configureGit();
        await ensureBranch();

        // Check if there are changes
        const status = await getStatus();
        if (status.isClean) {
            archiverLogger.info('No changes to commit');
            return;
        }

        // Stage both tasks and archive directories
        const filesToStage = [config.tasksDir, config.archiveDir];
        await stageFiles(filesToStage);

        // Create commit message
        const message = `archive: Move ${folderCount} task(s) from ${monthStr} to archive`;

        await commit(message);
        await push();

        archiverLogger.info('Archive committed and pushed');
    } catch (error) {
        archiverLogger.error('Failed to commit archive', error);
        throw error;
    }
}

/**
 * Check if archiving should run (1st of the month)
 */
export function shouldRunArchive(): boolean {
    const today = new Date();
    return today.getDate() === 1;
}

/**
 * Check if there are tasks from last month that need archiving
 */
export async function hasTasksToArchive(): Promise<boolean> {
    const { year, month } = getPreviousMonth();
    const folders = await getTaskFoldersForMonth(year, month);
    return folders.length > 0;
}

// Re-export types and functions
export { getArchivePath, listArchivedMonths } from './file-mover.js';
