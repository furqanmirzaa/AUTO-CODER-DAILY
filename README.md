# 🤖 AutoCoderDaily

> Autonomous daily-code automation system that picks programming tasks, solves them using AI, and commits solutions to GitHub automatically.

[![Daily Automation](https://github.com/your-username/auto-coder-daily/actions/workflows/daily.yml/badge.svg)](https://github.com/your-username/auto-coder-daily/actions/workflows/daily.yml)
[![Monthly Archive](https://github.com/your-username/auto-coder-daily/actions/workflows/archive.yml/badge.svg)](https://github.com/your-username/auto-coder-daily/actions/workflows/archive.yml)

## ✨ Features

- **🎯 Task Selection**: Automatically picks one programming challenge per day from:

  - LeetCode problems
  - StackOverflow questions
  - GitHub "Good First Issues"
  - AI-generated custom challenges

- **🧠 AI-Powered Solutions**: Uses Google Gemini AI to:

  - Generate complete, working solutions
  - Create test cases
  - Provide complexity analysis

- **📝 Meaningful Commits**: Creates 5-10 incremental commits that:

  - Build up the solution gradually
  - Have human-quality commit messages
  - Run tests before each commit

- **📦 Automatic Archiving**: Monthly archival of completed tasks to keep the repo clean

- **🛡️ Safe Guards**:
  - Never rewrites Git history
  - Never force pushes
  - Runs tests before committing
  - Retry logic for failed operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- A GitHub repository
- Google Gemini API key

### Installation

1. **Clone this repository**:

   ```bash
   git clone https://github.com/your-username/auto-coder-daily.git
   cd auto-coder-daily
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GITHUB_TOKEN=your_github_token_here
   GITHUB_REPO=your_username/auto-coder-daily
   GIT_USER_NAME=Your Name
   GIT_USER_EMAIL=your.email@example.com
   ```

4. **Test the setup**:
   ```bash
   npm run daily -- --dry-run
   ```

### Manual Run

```bash
# Run the full daily pipeline
npm run daily

# Dry run (selects task but doesn't commit)
npm run daily -- --dry-run

# Run archive manually
npm run archive
```

## 📁 Project Structure

```
auto-coder-daily/
├── .github/workflows/     # GitHub Actions
│   ├── daily.yml         # Daily automation
│   └── archive.yml       # Monthly archiving
├── archive/              # Archived past tasks (auto-created)
├── scripts/
│   ├── runDaily.ts       # Daily run script
│   └── archive.ts        # Archive script
├── src/
│   ├── taskSelector/     # Task source integrations
│   │   ├── leetcode.ts
│   │   ├── stackoverflow.ts
│   │   ├── github-issues.ts
│   │   ├── ai-challenge.ts
│   │   └── index.ts
│   ├── solutionGenerator/ # AI solution generation
│   │   ├── ai-solver.ts
│   │   └── index.ts
│   ├── splitter/          # Solution step splitting
│   │   └── index.ts
│   ├── committer/         # Git operations
│   │   ├── git-operations.ts
│   │   ├── message-generator.ts
│   │   ├── test-runner.ts
│   │   └── index.ts
│   ├── archiver/          # Monthly archiving
│   │   ├── file-mover.ts
│   │   └── index.ts
│   ├── config/            # Configuration
│   │   └── index.ts
│   ├── utils/             # Utilities
│   │   ├── logger.ts
│   │   ├── delay.ts
│   │   └── file-writer.ts
│   └── index.ts          # Main entry point
├── tasks/                # Daily task folders (auto-created)
│   └── YYYY-MM-DD/
│       ├── problem.md
│       ├── solution-step-1.ts
│       ├── solution-step-N.ts
│       ├── solution-final.ts
│       └── solution.test.ts
└── tests/                # Unit tests
```

## ⚙️ Configuration

### Environment Variables

| Variable             | Required | Description                                                    |
| -------------------- | -------- | -------------------------------------------------------------- |
| `GEMINI_API_KEY`     | ✅       | Google Gemini API key                                          |
| `GITHUB_TOKEN`       | ✅       | GitHub PAT with repo access                                    |
| `GITHUB_REPO`        | ✅       | Repository name (owner/repo)                                   |
| `GIT_USER_NAME`      | ✅       | Commit author name                                             |
| `GIT_USER_EMAIL`     | ✅       | Commit author email                                            |
| `TASK_SOURCES`       | ❌       | Comma-separated sources (default: `leetcode,stackoverflow,ai`) |
| `MIN_COMMIT_DELAY`   | ❌       | Min delay between commits in ms (default: 60000)               |
| `MAX_COMMIT_DELAY`   | ❌       | Max delay between commits in ms (default: 180000)              |
| `MIN_SOLUTION_STEPS` | ❌       | Min number of commit steps (default: 5)                        |
| `MAX_SOLUTION_STEPS` | ❌       | Max number of commit steps (default: 10)                       |

### GitHub Actions Secrets

Add these secrets to your repository:

- `GEMINI_API_KEY`: Your Google Gemini API key

Add these variables (Settings → Variables):

- `GIT_USER_NAME`: Commit author name
- `GIT_USER_EMAIL`: Commit author email
- `TASK_SOURCES` (optional): Enabled task sources

## 🔧 How It Works

### Daily Pipeline

1. **Task Selection**: Rotates through enabled sources based on day of year
2. **Solution Generation**: Uses Gemini AI to create a complete solution
3. **Step Splitting**: Breaks solution into 5-10 incremental steps
4. **Commit Pipeline**:
   - Writes problem.md
   - For each step: writes code, runs checks, commits, pushes
   - Writes tests and final solution
5. **Random Delays**: 1-3 minute random delays between commits

### Monthly Archive

On the 1st of each month:

1. Identifies all task folders from previous month
2. Moves them to `/archive/YYYY-MM/`
3. Commits and pushes the archive

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Type checking
npx tsc --noEmit
```

## 📊 Monitoring

Track your automation:

- **GitHub Actions**: Check workflow runs for success/failure
- **Contribution Graph**: Verify commits appear on your profile
- **Tasks Directory**: Monitor daily task creation

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

This project is for educational and personal use. Be mindful of:

- GitHub's Terms of Service regarding automated activity
- API rate limits for LeetCode, StackOverflow, and GitHub
- AI-generated code should be reviewed for correctness

---

Built with ❤️ by AutoCoderDaily
