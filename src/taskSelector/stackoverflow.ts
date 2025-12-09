/**
 * StackOverflow Task Fetcher
 * 
 * Fetches programming questions from StackOverflow API.
 * Filters by popular programming tags.
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';
import type { Task, TaskDifficulty, TaskFetcher } from './types.js';
import { getTodayDateString } from '../utils/file-writer.js';

const soLogger = logger.child('StackOverflow');

const STACKOVERFLOW_API_URL = 'https://api.stackexchange.com/2.3';

/**
 * Programming tags to filter questions
 */
const PROGRAMMING_TAGS = [
    'javascript',
    'typescript',
    'algorithm',
    'data-structures',
    'arrays',
    'string',
    'dynamic-programming',
    'recursion',
    'sorting',
    'binary-search',
];

interface StackOverflowQuestion {
    question_id: number;
    title: string;
    body?: string;
    link: string;
    tags: string[];
    score: number;
    answer_count: number;
}

interface StackOverflowResponse {
    items: StackOverflowQuestion[];
    has_more: boolean;
    quota_remaining: number;
}

/**
 * Estimate difficulty based on tags and score
 */
function estimateDifficulty(question: StackOverflowQuestion): TaskDifficulty {
    const hardTags = ['dynamic-programming', 'recursion', 'graph', 'tree'];
    const easyTags = ['arrays', 'string', 'sorting'];

    const hasHardTag = question.tags.some(tag => hardTags.includes(tag));
    const hasEasyTag = question.tags.some(tag => easyTags.includes(tag));

    if (hasHardTag && question.score > 50) return 'hard';
    if (hasEasyTag && question.score < 20) return 'easy';
    return 'medium';
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
    return html
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
        .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/**
 * Convert StackOverflow question to our Task format
 */
function convertToTask(question: StackOverflowQuestion): Task {
    return {
        id: `stackoverflow-${question.question_id}`,
        title: question.title,
        description: question.body ? stripHtml(question.body) : question.title,
        source: 'stackoverflow',
        url: question.link,
        difficulty: estimateDifficulty(question),
        tags: question.tags,
        date: getTodayDateString(),
    };
}

/**
 * StackOverflow task fetcher implementation
 */
export const stackoverflowFetcher: TaskFetcher = {
    name: 'stackoverflow',

    async fetchTask(): Promise<Task> {
        soLogger.info('Fetching random StackOverflow question...');

        try {
            // Pick a random tag to search for variety
            const randomTag = PROGRAMMING_TAGS[Math.floor(Math.random() * PROGRAMMING_TAGS.length)];

            const response = await axios.get<StackOverflowResponse>(
                `${STACKOVERFLOW_API_URL}/questions`,
                {
                    params: {
                        order: 'desc',
                        sort: 'votes',
                        tagged: randomTag,
                        filter: 'withbody',
                        site: 'stackoverflow',
                        pagesize: 50,
                    },
                    timeout: 10000,
                }
            );

            const questions = response.data.items;

            if (!questions || questions.length === 0) {
                throw new Error('No questions found from StackOverflow API');
            }

            // Pick a random question from the results
            const randomIndex = Math.floor(Math.random() * questions.length);
            const question = questions[randomIndex];

            if (!question) {
                throw new Error('Failed to select a random question');
            }

            soLogger.info(`Fetched: "${question.title}" (tag: ${randomTag})`);
            return convertToTask(question);
        } catch (error) {
            soLogger.error('Failed to fetch from StackOverflow', error);
            throw error;
        }
    },

    async isAvailable(): Promise<boolean> {
        try {
            const response = await axios.get(`${STACKOVERFLOW_API_URL}/info`, {
                params: { site: 'stackoverflow' },
                timeout: 5000,
            });
            return response.status === 200;
        } catch {
            return false;
        }
    },
};

export default stackoverflowFetcher;
