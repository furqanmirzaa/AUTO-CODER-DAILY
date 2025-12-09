/**
 * AI Challenge Generator
 * 
 * Generates custom programming challenges using Google Gemini AI.
 * Creates varied, interesting problems with different difficulty levels.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { Task, TaskDifficulty, TaskFetcher } from './types.js';
import { getTodayDateString } from '../utils/file-writer.js';

const aiLogger = logger.child('AIChallenge');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Topics for challenge generation
 */
const CHALLENGE_TOPICS = [
    'array manipulation',
    'string processing',
    'linked lists',
    'binary trees',
    'graph algorithms',
    'dynamic programming',
    'sorting algorithms',
    'searching algorithms',
    'hash tables',
    'stack and queue',
    'recursion',
    'bit manipulation',
    'two pointers technique',
    'sliding window',
    'greedy algorithms',
];

/**
 * Generate a random difficulty
 */
function getRandomDifficulty(): TaskDifficulty {
    const difficulties: TaskDifficulty[] = ['easy', 'medium', 'hard'];
    return difficulties[Math.floor(Math.random() * difficulties.length)] as TaskDifficulty;
}

/**
 * Get a random topic
 */
function getRandomTopic(): string {
    return CHALLENGE_TOPICS[Math.floor(Math.random() * CHALLENGE_TOPICS.length)] as string;
}

/**
 * Parse the AI response into a Task object
 */
function parseAIResponse(response: string, difficulty: TaskDifficulty, topic: string): Task {
    // Try to extract structured data from the AI response
    const titleMatch = response.match(/Title:\s*(.+?)(?:\n|$)/i);
    const descriptionMatch = response.match(/Description:\s*([\s\S]+?)(?=Examples?:|Constraints?:|$)/i);
    const examplesMatch = response.match(/Examples?:\s*([\s\S]+?)(?=Constraints?:|$)/i);
    const constraintsMatch = response.match(/Constraints?:\s*([\s\S]+?)$/i);

    const title = titleMatch?.[1]?.trim() ?? `${topic.charAt(0).toUpperCase() + topic.slice(1)} Challenge`;
    const description = descriptionMatch?.[1]?.trim() ?? response;

    return {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title,
        description,
        source: 'ai',
        difficulty,
        tags: [topic, 'ai-generated', difficulty],
        date: getTodayDateString(),
        examples: examplesMatch?.[1]
            ? [{ input: examplesMatch[1].trim(), output: 'See description' }]
            : undefined,
        constraints: constraintsMatch?.[1]
            ? constraintsMatch[1].split('\n').filter(Boolean).map(c => c.trim())
            : undefined,
    };
}

/**
 * AI Challenge task fetcher implementation
 */
export const aiChallengeFetcher: TaskFetcher = {
    name: 'ai',

    async fetchTask(): Promise<Task> {
        aiLogger.info('Generating AI programming challenge...');

        const difficulty = getRandomDifficulty();
        const topic = getRandomTopic();

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `Generate a ${difficulty} difficulty programming challenge about ${topic}.

Format your response EXACTLY as follows:

Title: [A concise, descriptive title for the problem]

Description: [A clear, detailed description of the problem. Explain what the function/algorithm should do, what inputs it receives, and what output it should produce.]

Examples:
Input: [example input]
Output: [expected output]
Explanation: [brief explanation]

Input: [another example]
Output: [expected output]

Constraints:
- [constraint 1, e.g., "1 <= n <= 10^5"]
- [constraint 2]
- [constraint 3]

Make the challenge interesting, practical, and educational. The problem should be solvable in TypeScript/JavaScript.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            if (!response) {
                throw new Error('Empty response from Gemini AI');
            }

            const task = parseAIResponse(response, difficulty, topic);
            aiLogger.info(`Generated: "${task.title}" (${difficulty}, ${topic})`);

            return task;
        } catch (error) {
            aiLogger.error('Failed to generate AI challenge', error);
            throw error;
        }
    },

    async isAvailable(): Promise<boolean> {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent('Hello');
            return !!result.response.text();
        } catch {
            return false;
        }
    },
};

export default aiChallengeFetcher;
