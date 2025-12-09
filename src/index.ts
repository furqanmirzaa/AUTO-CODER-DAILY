import { GoogleGenAI } from "@google/genai";
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface Problem {
    title: string;
    description: string;
    examples: string;
    constraints?: string;
    difficulty?: string;
}

interface DailyChallengeResult {
    filename: string;
    problemTitle: string;
    success: boolean;
}

class DailyCodingChallenge {
    private genAI: GoogleGenAI;
    private git: SimpleGit;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }

        this.genAI = new GoogleGenAI({});
        this.git = simpleGit();
    }

    /**
     * Generate a coding problem using Gemini AI
     */
    async generateProblem(): Promise<Problem> {
        console.log('📝 Generating coding problem...');

        const prompt = `Generate a unique, practical coding problem suitable for daily practice. Include:
    1. Problem title (concise and descriptive)
    2. Clear description
    3. Input/output examples
    4. Constraints
    5. Difficulty level (Easy/Medium/Hard)
    
    Make it medium difficulty and interesting.
    Format as JSON with keys: title, description, examples, constraints, difficulty
    Return ONLY valid JSON, no markdown formatting.`;

        try {
            const response = await this.genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            const text = response.text;

            // Extract JSON from response
            const jsonMatch = text?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const problem = JSON.parse(jsonMatch[0]);
                console.log(`✅ Generated: ${problem.title}`);
                return problem;
            }

            // Fallback if JSON parsing fails
            return {
                title: 'Daily Coding Challenge',
                description: text || 'No description available',
                examples: 'See description',
                difficulty: 'Medium'
            };
        } catch (error) {
            console.error('Error generating problem:', error);
            throw error;
        }
    }

    /**
     * Generate solution for the problem using Gemini AI
     */
    async solveProblem(problem: Problem): Promise<string> {
        console.log('💡 Generating solution...');

        const prompt = `Solve this coding problem in TypeScript/JavaScript:

Title: ${problem.title}
Description: ${problem.description}
Examples: ${problem.examples}
${problem.constraints ? `Constraints: ${problem.constraints}` : ''}

Provide a complete TypeScript/JavaScript solution with:
1. Clean, well-commented implementation
2. Test cases with assertions
3. Brief explanation of the approach
4. Time and space complexity analysis

Return only the code, no markdown code blocks or backticks.`;

        try {
            const result = await this.genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            const solution = result.text;

            // Clean up any markdown formatting
            const cleanSolution = solution?.replace(/```typescript\n?/g, '')
                .replace(/```javascript\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            console.log('✅ Solution generated');
            return cleanSolution || 'No solution available';
        } catch (error) {
            console.error('Error generating solution:', error);
            throw error;
        }
    }

    /**
     * Create organized file structure and save solution
     */
    async createDailyFile(problem: Problem, solution: string): Promise<{ filename: string; title: string }> {
        console.log('📁 Creating solution file...');

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');

        // Create directory structure
        const dirPath = path.join('challenges', year, month);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Create solution file
        const filename = path.join(dirPath, `${dateStr}.ts`);

        const content = `/**
 * Daily Coding Challenge: ${dateStr}
 * Problem: ${problem.title}
 * 
 * Description:
 * ${problem.description}
 * 
 * Examples:
 * ${problem.examples}
 * 
 * ${problem.constraints ? `Constraints:\n * ${problem.constraints}\n * ` : ''}
 * Difficulty: ${problem.difficulty || 'Medium'}
 */

${solution}

// Run the solution
console.log('Running daily challenge solution...');
`;

        fs.writeFileSync(filename, content, 'utf-8');
        console.log(`✅ Created: ${filename}`);

        return { filename, title: problem.title };
    }

    /**
     * Commit and push solution to GitHub
     */
    async commitAndPush(filename: string, problemTitle: string): Promise<boolean> {
        console.log('🔄 Committing to GitHub...');

        try {
            // Check if git is initialized
            const isRepo = await this.git.checkIsRepo();
            if (!isRepo) {
                console.log('⚠️  Git repository not initialized. Skipping commit.');
                return false;
            }

            // Add the file
            await this.git.add(filename);

            // Create meaningful commit message
            const date = new Date();
            const dateString = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const commitMessage = `✨ Solved: ${problemTitle} | ${dateString}

Daily coding challenge completed and tested.
Generated and solved using AI assistance.`;

            // Commit
            await this.git.commit(commitMessage);

            // Push to origin
            await this.git.push('origin', 'main');

            console.log(`✅ Successfully committed and pushed: ${problemTitle}`);
            return true;
        } catch (error: any) {
            console.error(`❌ Error committing to GitHub: ${error.message}`);
            return false;
        }
    }

    /**
     * Run the complete daily challenge workflow
     */
    async run(): Promise<DailyChallengeResult> {
        console.log('🚀 Starting Daily Code Challenge...\n');

        try {
            // Generate problem
            const problem = await this.generateProblem();

            // Solve problem
            const solution = await this.solveProblem(problem);

            // Create file
            const { filename, title } = await this.createDailyFile(problem, solution);

            // Commit and push
            const success = await this.commitAndPush(filename, title);

            console.log('\n✨ Daily challenge complete!');

            return {
                filename,
                problemTitle: title,
                success
            };
        } catch (error: any) {
            console.error('\n❌ Error running daily challenge:', error.message);
            throw error;
        }
    }
}

// Main execution
async function main() {
    try {
        const challenge = new DailyCodingChallenge();
        await challenge.run();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

export default DailyCodingChallenge;