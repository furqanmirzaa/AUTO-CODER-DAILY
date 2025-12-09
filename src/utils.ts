/**
 * Utility functions
 */

/**
 * Get current date string in YYYY-MM-DD format
 */
export function getDateString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get formatted date string for display
 */
export function getFormattedDate(): string {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}


export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getRandomStages = (min = 5, max = 10) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Clean markdown code blocks from text
 */
export function cleanMarkdown(text: string): string {
    return text
        .replace(/```typescript\n?/g, '')
        .replace(/```javascript\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
}

/**
 * Extract JSON object from text
 */
export function extractJSON<T>(text: string): T | null {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]) as T;
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Console logging helpers
 */
export const log = {
    info: (msg: string) => console.log(`📝 ${msg}`),
    success: (msg: string) => console.log(`✅ ${msg}`),
    error: (msg: string) => console.error(`❌ ${msg}`),
    warn: (msg: string) => console.log(`⚠️  ${msg}`),
    start: (msg: string) => console.log(`🚀 ${msg}`),
    complete: (msg: string) => console.log(`✨ ${msg}`),
    git: (msg: string) => console.log(`🔄 ${msg}`),
    file: (msg: string) => console.log(`📁 ${msg}`),
    ai: (msg: string) => console.log(`💡 ${msg}`),
};
