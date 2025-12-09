#!/usr/bin/env npx tsx
/**
 * Archive Script
 * 
 * Archives previous month's tasks to the archive folder.
 * Should be run on the 1st of every month.
 * 
 * Usage:
 *   npm run archive
 *   npm run archive -- --month 2024-01  (archive specific month)
 */

import { archiveMonth, archivePreviousMonth, listArchivedMonths } from '../src/archiver/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');
const list = args.includes('--list') || args.includes('-l');
const monthIndex = args.findIndex(arg => arg === '--month' || arg === '-m');
const specificMonth = monthIndex !== -1 ? args[monthIndex + 1] : undefined;

if (help) {
    console.log(`
AutoCoderDaily - Archive Script

Usage:
  npm run archive                    Archive previous month's tasks
  npm run archive -- --month 2024-01 Archive a specific month
  npm run archive -- --list          List all archived months
  npm run archive -- --help          Show this help message

This script moves task folders from /tasks/YYYY-MM-DD/ to /archive/YYYY-MM/
and commits the changes to Git.
`);
    process.exit(0);
}

console.log('╔════════════════════════════════════════╗');
console.log('║      AutoCoderDaily - Archive Run      ║');
console.log('╚════════════════════════════════════════╝');
console.log('');

async function main(): Promise<void> {
    if (list) {
        console.log('📁 Archived months:');
        const months = await listArchivedMonths();
        if (months.length === 0) {
            console.log('   (none)');
        } else {
            months.forEach(month => console.log(`   - ${month}`));
        }
        return;
    }

    let result;

    if (specificMonth) {
        // Parse YYYY-MM format
        const match = specificMonth.match(/^(\d{4})-(\d{2})$/);
        if (!match) {
            console.error('❌ Invalid month format. Use YYYY-MM (e.g., 2024-01)');
            process.exit(1);
        }
        const year = parseInt(match[1] as string, 10);
        const month = parseInt(match[2] as string, 10);

        console.log(`📦 Archiving ${specificMonth}...`);
        result = await archiveMonth(year, month);
    } else {
        console.log('📦 Archiving previous month...');
        result = await archivePreviousMonth();
    }

    if (result.success) {
        console.log('');
        console.log(`✅ Archive complete: ${result.movedFolders} folder(s) archived`);
        if (result.archivePath) {
            console.log(`📂 Location: ${result.archivePath}`);
        }
    } else {
        console.error('');
        console.error(`❌ Archive failed: ${result.error}`);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('❌ Archive failed:', error.message);
    process.exit(1);
});
