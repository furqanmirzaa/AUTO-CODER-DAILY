/**
 * Type definitions for the Daily Coding Challenge
 */

export interface Problem {
    title: string;
    description: string;
    examples: string;
    constraints?: string;
    difficulty?: string;
}

export interface DailyChallengeResult {
    filename: string;
    problemTitle: string;
    success: boolean;
}
