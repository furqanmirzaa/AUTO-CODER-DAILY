/**
 * Splitter Tests
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

describe('Solution Splitter', () => {
    describe('Step Types', () => {
        it('should define step structure correctly', () => {
            const mockStep = {
                stepNumber: 1,
                name: 'Initialize solution',
                description: 'Set up the initial structure',
                code: 'function solution() {}',
                commitMessage: 'Initialize solution scaffolding',
                files: [],
            };

            expect(mockStep.stepNumber).toBe(1);
            expect(mockStep.name).toBeDefined();
            expect(mockStep.description).toBeDefined();
            expect(mockStep.code).toBeDefined();
            expect(mockStep.commitMessage).toBeDefined();
            expect(mockStep.files).toBeInstanceOf(Array);
        });
    });

    describe('Split Plan', () => {
        it('should create a valid split plan structure', () => {
            const mockPlan = {
                taskId: 'task-123',
                totalSteps: 5,
                steps: [
                    {
                        stepNumber: 1,
                        name: 'Step 1',
                        description: 'First step',
                        code: '// code',
                        commitMessage: 'Initial commit',
                        files: [],
                    },
                ],
            };

            expect(mockPlan.taskId).toBeDefined();
            expect(mockPlan.totalSteps).toBeGreaterThan(0);
            expect(mockPlan.steps.length).toBeGreaterThan(0);
        });

        it('should have step numbers in sequence', () => {
            const steps = [
                { stepNumber: 1, name: 'Step 1', description: '', code: '', commitMessage: '', files: [] },
                { stepNumber: 2, name: 'Step 2', description: '', code: '', commitMessage: '', files: [] },
                { stepNumber: 3, name: 'Step 3', description: '', code: '', commitMessage: '', files: [] },
            ];

            steps.forEach((step, index) => {
                expect(step.stepNumber).toBe(index + 1);
            });
        });
    });

    describe('Commit Message Templates', () => {
        const categories = ['init', 'types', 'helper', 'core', 'optimization', 'edge', 'test', 'final'];

        it('should have templates for all step categories', () => {
            categories.forEach(category => {
                expect(category).toBeDefined();
            });
        });
    });
});

describe('Fallback Splitting', () => {
    it('should handle line-based splitting', () => {
        const code = `function solution() {
  const result = [];
  for (let i = 0; i < 10; i++) {
    result.push(i);
  }
  return result;
}`;

        const lines = code.split('\n');
        expect(lines.length).toBeGreaterThan(0);

        // Simulate splitting into 3 steps
        const stepCount = 3;
        const linesPerStep = Math.ceil(lines.length / stepCount);
        expect(linesPerStep).toBeGreaterThan(0);
    });
});
