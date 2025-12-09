You are building a fully autonomous daily-code automation system.

GOAL:
Create a production-ready project that, once deployed, will automatically:
1. Pick ONE programming task per day.
2. Solve it.
3. Split the solution into 5–10 meaningful commits.
4. Push each commit to GitHub with human-quality messages.
5. Run linting + tests before each commit.
6. Archive old tasks to keep repository size small.
7. Never rewrite Git history.
8. Never break the contribution graph.
9. Be future-proof, scalable, and self-maintaining.

PROJECT DEFINITION:
The system must execute this daily cycle:

A) TASK SELECTION PIPELINE
- Choose one problem per day from:
  • LeetCode (use public API scraping if needed)
  • StackOverflow (random question from a tagged list)
  • GitHub Issues (from selected repos)
  • AI-generated custom challenges
- Store metadata: problem title, difficulty, URL, source, date.

B) SOLUTION GENERATION PIPELINE
- Generate the full correct solution using an AI model.
- Auto-generate test cases.
- Run tests locally to confirm correctness.
- Then create a “solution plan” split into 5–10 random steps:
  • step names
  • description of work
  • code expected in each step
- These steps must build up the full final solution gradually.

C) COMMIT PIPELINE
For each step:
- Write only that partial code into a dedicated folder structure:
    /tasks/YYYY-MM-DD/
        problem.md
        solution-step-1.js
        ...
        solution-final.js
- Run tests before commit.
- If tests pass, commit.
- Push to GitHub immediately.
- Commit messages must be meaningful:
    Example:
    • “Initialize solution scaffolding for today’s problem”
    • “Implement DP state transitions”
    • “Add full test suite for edge cases”

D) ARCHIVE PIPELINE (monthly)
- On the 1st of every month:
  • Move previous month’s tasks into /archive/YYYY-MM/
  • Zip or delete raw files
  • Commit archive movement
  • Ensure commit history is never rewritten or squashed.

E) FAIL-SAFES
- Never push code that fails tests.
- Never perform force pushes, rebases, or history rewrites.
- If a commit fails, retry once and log.
- Use robust error handling.

ARCHITECTURE REQUIREMENTS:
- Use Node.js + TypeScript.
- Use a tasks/ directory for daily work.
- Use an archive/ directory for old tasks.
- Use GitHub Actions (cron) to trigger daily run.
- Use environment variables for credentials.
- Use modular, clean architecture:
    /src/
      taskSelector/
      solutionGenerator/
      splitter/
      committer/
      archiver/
      utils/
- Write strong comments throughout the codebase.
- Include a README that explains everything cleanly.

DELIVERABLES TO GENERATE:
1. Full folder structure  
2. package.json  
3. src/ code for all modules  
4. GitHub Actions CI YAML  
5. Test framework setup (Jest or Vitest)  
6. Config files (.env.example, tsconfig.json, .gitignore)  
7. Full documentation in README  
8. Utility scripts (runDaily.js, archive.js, etc.)

ADDITIONAL BEHAVIOR:
- All code must follow best practices.
- Avoid triggering GitHub’s bot detection.
- Commit timing should be slightly random (within 1–3 minutes between commits).
- Code within tasks must be meaningful and varied per day.
- System must be able to run indefinitely.

Now generate the entire project exactly according to these specifications.
