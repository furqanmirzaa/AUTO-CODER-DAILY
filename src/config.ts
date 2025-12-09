/**
 * Configuration and environment variables
 */

import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: 'gemini-2.5-flash',
} as const;

export function validateConfig(): void {
    if (!config.geminiApiKey) {
        throw new Error('GEMINI_API_KEY not found in environment variables');
    }
}
