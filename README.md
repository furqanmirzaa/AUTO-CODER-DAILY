# 🚀 AutoCoder Daily

An automated system that generates, solves, and commits a coding challenge every day using Google's Gemini AI.

## 📋 Features

- **Automatic Problem Generation**: Uses Gemini AI to create unique coding problems daily
- **AI-Powered Solutions**: Generates TypeScript solutions with test cases
- **GitHub Integration**: Automatically commits solutions with meaningful messages
- **Organized Structure**: Solutions organized by year/month
- **Fully Automated**: Runs daily via GitHub Actions

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- GitHub account

### Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/daily-code-challenge.git
   cd daily-code-challenge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Run locally (test)**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

### GitHub Setup

1. **Push to GitHub**

   ```bash
   git remote add origin https://github.com/yourusername/daily-code-challenge.git
   git branch -M main
   git push -u origin main
   ```

2. **Add GitHub Secret**

   - Go to Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

3. **Enable GitHub Actions**

   - Go to Actions tab
   - Enable workflows if prompted
   - The workflow will run daily at 9 AM UTC

4. **Test Manual Run**
   - Go to Actions → Daily Code Challenge
   - Click "Run workflow" → "Run workflow"

## 📁 Project Structure

```
daily-code-challenge/
├── .github/
│   └── workflows/
│       └── daily-challenge.yml    # GitHub Actions workflow
├── src/
│   └── index.ts                   # Main application
├── challenges/                    # Generated solutions
│   └── YYYY/
│       └── MM/
│           └── YYYY-MM-DD.ts
├── dist/                          # Compiled JavaScript
├── .env                           # Environment variables (local only)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 How It Works

1. **Generate**: Gemini AI creates a unique coding problem
2. **Solve**: AI generates a TypeScript solution with tests
3. **Organize**: Solution saved in organized folder structure
4. **Commit**: Automatically committed to GitHub with descriptive message
5. **Repeat**: Process runs daily via GitHub Actions

## 🔧 Customization

### Change Schedule

Edit `.github/workflows/daily-challenge.yml`:

```yaml
schedule:
  - cron: "0 14 * * *" # 2 PM UTC
```

### Change Difficulty

Edit `src/index.ts` in the `generateProblem()` method:

```typescript
Make it easy/medium/hard difficulty and interesting.
```

### Change Language

Modify the `solveProblem()` prompt to use Python, Java, Go, etc.

## 📊 Scripts

```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Run the compiled code
npm run dev      # Run with ts-node (development)
npm run watch    # Watch mode with auto-reload
```

## 🐛 Troubleshooting

**GitHub Actions not running:**

- Check if schedule is correct (use [crontab.guru](https://crontab.guru))
- Verify repository has Actions enabled
- Check Actions tab for error logs

**Push fails:**

- Ensure `GITHUB_TOKEN` has write permissions
- Go to Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

**API errors:**

- Verify `GEMINI_API_KEY` is set correctly in GitHub Secrets
- Check API quota limits
- Ensure API key is valid

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Feel free to open issues or submit pull requests!

---

Made with ❤️ and AI
