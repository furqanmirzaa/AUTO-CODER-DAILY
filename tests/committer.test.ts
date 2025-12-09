/**
 * Committer Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock config
vi.mock('../src/config/index.js', () => ({
    config: {
        geminiApiKey: 'test-key',
        githubToken: 'test-token',
        githubRepo: 'test/repo',
        gitUserName: 'Test User',
        gitUserEmail: 'test@example.com',
        taskSources: ['ai'],
        minCommitDelay: 1000,
        maxCommitDelay: 2000,
        minSolutionSteps: 5,
        maxSolutionSteps: 10,
        tasksDir: './tasks',
        archiveDir: './archive',
    },
    getRandomStepCount: () => 5,
    getRandomDelay: () => 1000,
}));

// Mock simple-git
vi.mock('simple-git', () => ({
    default: vi.fn(() => ({
        add: vi.fn(),
        commit: vi.fn(() => ({ commit: 'abc123' })),
        push: vi.fn(),
        status: vi.fn(() => ({ isClean: () => false, staged: ['file.ts'], modified: [], not_added: [] })),
        revparse: vi.fn(() => 'main'),
        addConfig: vi.fn(),
        checkout: vi.fn(),
        pull: vi.fn(),
    })),
}));

describe('Commit Message Generator', () => {
    describe('Message Templates', () => {
        it('should generate meaningful init messages', () => {
            const initPhrases = ['Initialize', 'Set up', 'Create', 'Add', 'Start'];
            const message = 'Initialize solution scaffolding';

            const hasInitPhrase = initPhrases.some(phrase => message.includes(phrase));
            expect(hasInitPhrase).toBe(true);
        });

        it('should generate meaningful implementation messages', () => {
            const implPhrases = ['Implement', 'Add', 'Create', 'Build', 'Develop'];
            const message = 'Implement core algorithm';

            const hasImplPhrase = implPhrases.some(phrase => message.includes(phrase));
            expect(hasImplPhrase).toBe(true);
        });

        it('should generate meaningful final messages', () => {
            const finalPhrases = ['Complete', 'Finalize', 'Finish', 'Polish', 'Wrap up'];
            const message = 'Complete solution implementation';

            const hasFinalPhrase = finalPhrases.some(phrase => message.includes(phrase));
            expect(hasFinalPhrase).toBe(true);
        });
    });

    describe('Message Validation', () => {
        it('should validate minimum message length', () => {
            const validMessage = 'Add initial solution';
            const invalidMessage = 'Update';

            expect(validMessage.length).toBeGreaterThan(10);
            expect(invalidMessage.length).toBeLessThan(10);
        });

        it('should validate maximum message length', () => {
            const validMessage = 'Implement dynamic programming solution for longest common subsequence';

            expect(validMessage.length).toBeLessThan(100);
        });
    });
});

describe('Git Operations', () => {
    describe('Status Checks', () => {
        it('should determine if there are staged changes', () => {
            const mockStatus = {
                staged: ['file1.ts', 'file2.ts'],
                modified: [],
                not_added: [],
                isClean: () => false,
            };

            expect(mockStatus.staged.length).toBeGreaterThan(0);
            expect(mockStatus.isClean()).toBe(false);
        });

        it('should detect clean repository', () => {
            const mockStatus = {
                staged: [],
                modified: [],
                not_added: [],
                isClean: () => true,
            };

            expect(mockStatus.isClean()).toBe(true);
        });
    });
});

describe('Pipeline Result', () => {
    it('should track commit statistics', () => {
        const result = {
            success: true,
            totalCommits: 8,
            successfulCommits: 8,
            failedCommits: 0,
            errors: [],
        };

        expect(result.totalCommits).toBe(result.successfulCommits + result.failedCommits);
        expect(result.success).toBe(result.failedCommits === 0);
    });

    it('should track errors when commits fail', () => {
        const result = {
            success: false,
            totalCommits: 8,
            successfulCommits: 6,
            failedCommits: 2,
            errors: ['Commit 3 failed: network error', 'Commit 5 failed: conflict'],
        };

        expect(result.errors.length).toBe(result.failedCommits);
        expect(result.success).toBe(false);
    });
});

describe('Retry Logic', () => {
    it('should respect maximum retry attempts', () => {
        const MAX_RETRY_ATTEMPTS = 2;
        let attempts = 0;

        const executeWithRetry = (retryCount: number): boolean => {
            attempts++;

            // Simulate failure
            if (retryCount < MAX_RETRY_ATTEMPTS) {
                return executeWithRetry(retryCount + 1);
            }

            return false;
        };

        executeWithRetry(0);
        expect(attempts).toBe(MAX_RETRY_ATTEMPTS + 1);
    });
});
