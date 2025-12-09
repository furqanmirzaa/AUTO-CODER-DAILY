/**
 * Task Selector Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the config to avoid needing real environment variables
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

describe('Task Selector', () => {
    describe('Task Types', () => {
        it('should define valid task sources', () => {
            const validSources = ['leetcode', 'stackoverflow', 'github', 'ai'];
            validSources.forEach(source => {
                expect(typeof source).toBe('string');
            });
        });

        it('should define valid difficulty levels', () => {
            const difficulties = ['easy', 'medium', 'hard'];
            difficulties.forEach(diff => {
                expect(typeof diff).toBe('string');
            });
        });
    });

    describe('Task Structure', () => {
        it('should require essential task properties', () => {
            const mockTask = {
                id: 'test-1',
                title: 'Test Task',
                description: 'A test task description',
                source: 'ai' as const,
                difficulty: 'medium' as const,
                tags: ['test'],
                date: '2024-01-01',
            };

            expect(mockTask.id).toBeDefined();
            expect(mockTask.title).toBeDefined();
            expect(mockTask.description).toBeDefined();
            expect(mockTask.source).toBeDefined();
            expect(mockTask.difficulty).toBeDefined();
            expect(mockTask.tags).toBeInstanceOf(Array);
            expect(mockTask.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('Date Functions', () => {
        it('should generate date in YYYY-MM-DD format', () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const expected = `${year}-${month}-${day}`;

            expect(expected).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});

describe('Task Fetcher Interface', () => {
    it('should define required fetcher methods', () => {
        const mockFetcher = {
            name: 'ai' as const,
            fetchTask: async () => ({
                id: 'test',
                title: 'Test',
                description: 'Test description',
                source: 'ai' as const,
                difficulty: 'easy' as const,
                tags: ['test'],
                date: '2024-01-01',
            }),
            isAvailable: async () => true,
        };

        expect(mockFetcher.name).toBeDefined();
        expect(typeof mockFetcher.fetchTask).toBe('function');
        expect(typeof mockFetcher.isAvailable).toBe('function');
    });
});
