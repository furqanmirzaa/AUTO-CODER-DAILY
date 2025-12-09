/**
 * Solution Generator Types
 * 
 * Type definitions for solutions and test cases.
 */

/**
 * A complete solution for a task
 */
export interface Solution {
    /** The task this solution is for */
    taskId: string;

    /** Full solution code */
    code: string;

    /** Explanation of the approach */
    explanation: string;

    /** Time complexity analysis */
    timeComplexity: string;

    /** Space complexity analysis */
    spaceComplexity: string;

    /** Generated test cases */
    testCases: TestCase[];

    /** Test code to run */
    testCode: string;
}

/**
 * A test case for validating the solution
 */
export interface TestCase {
    /** Test case description */
    description: string;

    /** Input for the test */
    input: string;

    /** Expected output */
    expectedOutput: string;

    /** Whether this is an edge case */
    isEdgeCase: boolean;
}
