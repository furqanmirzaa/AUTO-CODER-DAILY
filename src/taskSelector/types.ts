/**
 * Task Types
 * 
 * Type definitions for tasks and task sources.
 */

/**
 * Available task source platforms
 */
export type TaskSource = 'leetcode' | 'stackoverflow' | 'github' | 'ai';

/**
 * Difficulty levels for tasks
 */
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Represents a programming task to be solved
 */
export interface Task {
    /** Unique identifier for the task */
    id: string;

    /** Task title */
    title: string;

    /** Full problem description */
    description: string;

    /** Source platform */
    source: TaskSource;

    /** Original URL (if available) */
    url?: string;

    /** Difficulty level */
    difficulty: TaskDifficulty;

    /** Programming language tags */
    tags: string[];

    /** Date the task was selected (YYYY-MM-DD) */
    date: string;

    /** Any example inputs/outputs provided */
    examples?: TaskExample[] | undefined;

    /** Any constraints or requirements */
    constraints?: string[] | undefined;
}

/**
 * Example input/output for a task
 */
export interface TaskExample {
    input: string;
    output: string;
    explanation?: string;
}

/**
 * Interface for task fetcher implementations
 */
export interface TaskFetcher {
    /** Name of this fetcher */
    name: TaskSource;

    /** Fetch a random task */
    fetchTask(): Promise<Task>;

    /** Check if this fetcher is available */
    isAvailable(): Promise<boolean>;
}
