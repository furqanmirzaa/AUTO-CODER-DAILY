/**
 * LeetCode Task Fetcher
 * 
 * Fetches random programming problems from LeetCode using their GraphQL API.
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';
import type { Task, TaskDifficulty, TaskFetcher } from './types.js';
import { getTodayDateString } from '../utils/file-writer.js';

const leetcodeLogger = logger.child('LeetCode');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

/**
 * GraphQL query to fetch a random question
 */
const RANDOM_QUESTION_QUERY = `
  query randomQuestion {
    randomQuestion {
      questionId
      title
      titleSlug
      difficulty
      content
      topicTags {
        name
      }
      exampleTestcases
    }
  }
`;

/**
 * GraphQL query to fetch question details by slug
 */
const QUESTION_DETAIL_QUERY = `
  query questionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      content
      topicTags {
        name
      }
      exampleTestcases
      hints
    }
  }
`;

interface LeetCodeQuestion {
    questionId: string;
    title: string;
    titleSlug: string;
    difficulty: string;
    content: string;
    topicTags: { name: string }[];
    exampleTestcases?: string;
}

/**
 * Convert LeetCode difficulty to our TaskDifficulty
 */
function mapDifficulty(difficulty: string): TaskDifficulty {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'easy';
        case 'medium':
            return 'medium';
        case 'hard':
            return 'hard';
        default:
            return 'medium';
    }
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
}

/**
 * Convert LeetCode question to our Task format
 */
function convertToTask(question: LeetCodeQuestion): Task {
    return {
        id: `leetcode-${question.questionId}`,
        title: question.title,
        description: stripHtml(question.content),
        source: 'leetcode',
        url: `https://leetcode.com/problems/${question.titleSlug}/`,
        difficulty: mapDifficulty(question.difficulty),
        tags: question.topicTags.map(tag => tag.name),
        date: getTodayDateString(),
        examples: question.exampleTestcases
            ? question.exampleTestcases.split('\n').filter(Boolean).map((ex, i) => ({
                input: ex,
                output: `Expected output for example ${i + 1}`,
            }))
            : undefined,
    };
}

/**
 * LeetCode task fetcher implementation
 */
export const leetcodeFetcher: TaskFetcher = {
    name: 'leetcode',

    async fetchTask(): Promise<Task> {
        leetcodeLogger.info('Fetching random LeetCode problem...');

        try {
            const response = await axios.post(
                LEETCODE_GRAPHQL_URL,
                {
                    query: RANDOM_QUESTION_QUERY,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (compatible; AutoCoderDaily/1.0)',
                    },
                    timeout: 10000,
                }
            );

            const question = response.data.data?.randomQuestion as LeetCodeQuestion | undefined;

            if (!question) {
                throw new Error('No question returned from LeetCode API');
            }

            leetcodeLogger.info(`Fetched: "${question.title}" (${question.difficulty})`);
            return convertToTask(question);
        } catch (error) {
            leetcodeLogger.error('Failed to fetch from LeetCode', error);
            throw error;
        }
    },

    async isAvailable(): Promise<boolean> {
        try {
            const response = await axios.get('https://leetcode.com', {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AutoCoderDaily/1.0)',
                },
            });
            return response.status === 200;
        } catch {
            return false;
        }
    },
};

export default leetcodeFetcher;
