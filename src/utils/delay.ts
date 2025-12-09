/**
 * Delay Utility
 * 
 * Provides functions for adding delays between operations.
 * Used to add random delays between commits to avoid bot detection.
 */

import { getRandomDelay } from '../config/index.js';
import { logger } from './logger.js';

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sleep for a random duration within the configured range
 * Logs the delay duration for transparency
 */
export async function randomDelay(): Promise<void> {
    const delay = getRandomDelay();
    const delaySeconds = Math.round(delay / 1000);

    logger.info(`Waiting ${delaySeconds} seconds before next operation...`);
    await sleep(delay);
}

/**
 * Execute a function with a random delay before it
 */
export async function withRandomDelay<T>(fn: () => Promise<T>): Promise<T> {
    await randomDelay();
    return fn();
}

/**
 * Format milliseconds as a human-readable duration
 */
export function formatDuration(ms: number): string {
    if (ms < 1000) {
        return `${ms}ms`;
    }

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}
