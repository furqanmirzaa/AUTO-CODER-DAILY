/**
 * GitHub Issues Task Fetcher
 * 
 * Fetches "good first issue" labeled issues from popular open-source repos.
 */

import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { Task, TaskDifficulty, TaskFetcher } from './types.js';
import { getTodayDateString } from '../utils/file-writer.js';

const githubLogger = logger.child('GitHub');

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Popular repos with good first issues
 */
const POPULAR_REPOS = [
    'facebook/react',
    'vuejs/vue',
    'angular/angular',
    'microsoft/TypeScript',
    'nodejs/node',
    'expressjs/express',
    'vercel/next.js',
    'prisma/prisma',
];

interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string | null;
    html_url: string;
    labels: { name: string }[];
    repository_url: string;
}

interface GitHubSearchResponse {
    total_count: number;
    items: GitHubIssue[];
}

/**
 * Estimate difficulty based on labels
 */
function estimateDifficulty(issue: GitHubIssue): TaskDifficulty {
    const labels = issue.labels.map(l => l.name.toLowerCase());

    if (labels.some(l => l.includes('beginner') || l.includes('starter') || l.includes('first'))) {
        return 'easy';
    }
    if (labels.some(l => l.includes('hard') || l.includes('advanced') || l.includes('complex'))) {
        return 'hard';
    }
    return 'medium';
}

/**
 * Convert GitHub issue to our Task format
 */
function convertToTask(issue: GitHubIssue): Task {
    // Extract repo name from repository_url
    const repoMatch = issue.repository_url.match(/repos\/(.+)/);
    const repoName = repoMatch ? repoMatch[1] : 'unknown';

    return {
        id: `github-${issue.id}`,
        title: `[${repoName}] ${issue.title}`,
        description: issue.body ?? issue.title,
        source: 'github',
        url: issue.html_url,
        difficulty: estimateDifficulty(issue),
        tags: issue.labels.map(l => l.name),
        date: getTodayDateString(),
    };
}

/**
 * GitHub Issues task fetcher implementation
 */
export const githubFetcher: TaskFetcher = {
    name: 'github',

    async fetchTask(): Promise<Task> {
        githubLogger.info('Fetching random GitHub issue...');

        try {
            // Pick a random repo
            const randomRepo = POPULAR_REPOS[Math.floor(Math.random() * POPULAR_REPOS.length)];

            const response = await axios.get<GitHubSearchResponse>(
                `${GITHUB_API_URL}/search/issues`,
                {
                    params: {
                        q: `repo:${randomRepo} is:issue is:open label:"good first issue"`,
                        sort: 'created',
                        order: 'desc',
                        per_page: 30,
                    },
                    headers: {
                        Accept: 'application/vnd.github.v3+json',
                        Authorization: `token ${config.githubToken}`,
                    },
                    timeout: 10000,
                }
            );

            const issues = response.data.items;

            if (!issues || issues.length === 0) {
                // Fallback to searching all repos
                githubLogger.warn(`No issues found in ${randomRepo}, trying broader search...`);

                const fallbackResponse = await axios.get<GitHubSearchResponse>(
                    `${GITHUB_API_URL}/search/issues`,
                    {
                        params: {
                            q: 'is:issue is:open label:"good first issue" language:javascript',
                            sort: 'created',
                            order: 'desc',
                            per_page: 30,
                        },
                        headers: {
                            Accept: 'application/vnd.github.v3+json',
                            Authorization: `token ${config.githubToken}`,
                        },
                        timeout: 10000,
                    }
                );

                if (!fallbackResponse.data.items || fallbackResponse.data.items.length === 0) {
                    throw new Error('No issues found from GitHub API');
                }

                const randomIndex = Math.floor(Math.random() * fallbackResponse.data.items.length);
                const issue = fallbackResponse.data.items[randomIndex];

                if (!issue) {
                    throw new Error('Failed to select a random issue');
                }

                githubLogger.info(`Fetched: "${issue.title}"`);
                return convertToTask(issue);
            }

            // Pick a random issue from the results
            const randomIndex = Math.floor(Math.random() * issues.length);
            const issue = issues[randomIndex];

            if (!issue) {
                throw new Error('Failed to select a random issue');
            }

            githubLogger.info(`Fetched: "${issue.title}" from ${randomRepo}`);
            return convertToTask(issue);
        } catch (error) {
            githubLogger.error('Failed to fetch from GitHub', error);
            throw error;
        }
    },

    async isAvailable(): Promise<boolean> {
        try {
            const response = await axios.get(`${GITHUB_API_URL}/rate_limit`, {
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    Authorization: `token ${config.githubToken}`,
                },
                timeout: 5000,
            });
            return response.status === 200 && response.data.rate.remaining > 0;
        } catch {
            return false;
        }
    },
};

export default githubFetcher;
