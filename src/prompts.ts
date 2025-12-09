/**
 * AI Prompt templates
 */

export const PROMPTS = {
    generateProblem: `Generate a unique, practical coding problem suitable for daily practice. Include:
1. Problem title (concise and descriptive)
2. Clear description
3. Input/output examples
4. Constraints
5. Difficulty level (Easy/Medium/Hard)

Make it medium difficulty and interesting.
Format as JSON with keys: title, description, examples, constraints, difficulty
Return ONLY valid JSON, no markdown formatting.`,


    solveProblemStage: (
        title: string,
        description: string,
        examples: string,
        constraints: string | undefined,
        stage: number,
        totalStages: number
    ) => `
Solve the problem "${title}" in TypeScript (Stage ${stage}/${totalStages}):

Description: ${description}
Examples: ${examples}
${constraints ? `Constraints: ${constraints}` : ''}

Instructions:
1. Implement only the part of the solution for this stage.
2. Return JSON with keys:
{
  "code": "<TypeScript code for this stage>",
  "commitMessage": "<human-readable commit message describing this stage>"
}
3. Explanations must be in comments (/* */ or //).
4. No markdown, only valid JSON.
`,
} as const;
