#!/usr/bin/env npx tsx
/**
 * Daily Run Script
 * 
 * Executes the daily automation pipeline.
 * Can be run manually or triggered by GitHub Actions.
 * 
 * Usage:
 *   npm run daily
 *   npm run daily -- --dry-run
 */

import { runDailyPipeline } from '../src/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const help = args.includes('--help') || args.includes('-h');

if (help) {
    console.log(`
AutoCoderDaily - Daily Run Script

Usage:
  npm run daily              Run the full daily pipeline
  npm run daily -- --dry-run Select a task but don't commit
  npm run daily -- --help    Show this help message

Environment Variables Required:
  GEMINI_API_KEY    Google Gemini API key
  GITHUB_TOKEN      GitHub personal access token
  GITHUB_REPO       Repository name (owner/repo)
  GIT_USER_NAME     Git commit author name
  GIT_USER_EMAIL    Git commit author email

Optional Environment Variables:
  TASK_SOURCES      Comma-separated list of sources (leetcode,stackoverflow,ai)
  MIN_COMMIT_DELAY  Minimum delay between commits (ms)
  MAX_COMMIT_DELAY  Maximum delay between commits (ms)
`);
    process.exit(0);
}

console.log('╔════════════════════════════════════════╗');
console.log('║       AutoCoderDaily - Daily Run       ║');
console.log('╚════════════════════════════════════════╝');
console.log('');

if (dryRun) {
    console.log('🔍 Running in DRY RUN mode (no commits will be made)');
    console.log('');
}

runDailyPipeline({ dryRun })
    .then(() => {
        console.log('');
        console.log('✅ Daily run completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('');
        console.error('❌ Daily run failed:', error.message);
        process.exit(1);
    });
