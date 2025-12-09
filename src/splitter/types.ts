/**
 * Splitter Types
 * 
 * Type definitions for solution splitting.
 */

/**
 * A single step in the solution progression
 */
export interface SolutionStep {
    /** Step number (1-indexed) */
    stepNumber: number;

    /** Name of this step */
    name: string;

    /** Description of what this step does */
    description: string;

    /** Code for this step (cumulative) */
    code: string;

    /** Commit message for this step */
    commitMessage: string;

    /** Files to be committed in this step */
    files: string[];
}

/**
 * A plan for splitting a solution into steps
 */
export interface SplitPlan {
    /** The task ID this plan is for */
    taskId: string;

    /** Total number of steps */
    totalSteps: number;

    /** Individual solution steps */
    steps: SolutionStep[];
}
