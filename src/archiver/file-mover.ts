/**
 * File Mover Utility
 * 
 * Handles moving task folders to the archive directory.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const moverLogger = logger.child('FileMover');

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
    try {
        const stat = await fs.stat(dirPath);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Get all task folders for a specific month
 */
export async function getTaskFoldersForMonth(year: number, month: number): Promise<string[]> {
    const tasksDir = config.tasksDir;

    // Check if tasks directory exists
    if (!(await directoryExists(tasksDir))) {
        moverLogger.warn(`Tasks directory does not exist: ${tasksDir}`);
        return [];
    }

    // Read all entries in tasks directory
    const entries = await fs.readdir(tasksDir, { withFileTypes: true });

    // Filter for directories matching YYYY-MM-DD pattern for the given month
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;

    const folders = entries
        .filter(entry => entry.isDirectory())
        .filter(entry => entry.name.startsWith(monthPrefix))
        .map(entry => path.join(tasksDir, entry.name));

    return folders;
}

/**
 * Move a folder from source to destination
 */
export async function moveFolder(source: string, destination: string): Promise<void> {
    moverLogger.debug(`Moving: ${source} -> ${destination}`);

    // Ensure destination parent directory exists
    const destParent = path.dirname(destination);
    await ensureDirectory(destParent);

    // Use rename if possible (same filesystem), otherwise copy and delete
    try {
        await fs.rename(source, destination);
        moverLogger.debug(`Moved using rename`);
    } catch (error) {
        // If rename fails (e.g., cross-device), fall back to copy and delete
        if ((error as NodeJS.ErrnoException).code === 'EXDEV') {
            moverLogger.debug(`Cross-device move, using copy+delete`);
            await copyFolder(source, destination);
            await fs.rm(source, { recursive: true, force: true });
        } else {
            throw error;
        }
    }
}

/**
 * Copy a folder recursively
 */
export async function copyFolder(source: string, destination: string): Promise<void> {
    await ensureDirectory(destination);

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyFolder(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Get the archive path for a month
 */
export function getArchivePath(year: number, month: number): string {
    const monthStr = String(month).padStart(2, '0');
    return path.join(config.archiveDir, `${year}-${monthStr}`);
}

/**
 * List all archived months
 */
export async function listArchivedMonths(): Promise<string[]> {
    const archiveDir = config.archiveDir;

    if (!(await directoryExists(archiveDir))) {
        return [];
    }

    const entries = await fs.readdir(archiveDir, { withFileTypes: true });

    return entries
        .filter(entry => entry.isDirectory())
        .filter(entry => /^\d{4}-\d{2}$/.test(entry.name))
        .map(entry => entry.name);
}
