/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Contextual Log Session Extractor
 *
 * Description:
 * You are tasked with processing a list of raw log entries to extract specific 'sessions' and then filter them based on a keyword. A session begins with a log entry containing the marker `[SESSION_START]` and ends with a log entry containing `[SESSION_END]`. All log entries within this range, including the start and end markers, belong to that session.

Here are the rules for session demarcation:
1.  If `[SESSION_START]` is encountered while not currently in a session, a new session begins.
2.  If `[SESSION_END]` is encountered while currently in a session, the current session ends.
3.  If `[SESSION_START]` is encountered while already in a session, the current session implicitly ends at the line *before* the new `[SESSION_START]`, and a new session begins with the current `[SESSION_START]` line.
4.  If `[SESSION_END]` is encountered without an active preceding `[SESSION_START]`, it should be ignored.
5.  Any active session that does not encounter a `[SESSION_END]` marker by the end of the log file is considered complete at the last log entry.

After identifying all such sessions, you must filter them. Only sessions that contain the given `search_keyword` anywhere within *any* of their log entries (case-insensitive) should be included in the final output. The output should preserve the original order of log entries within each session and the order of filtered sessions as they appear in the original logs.
 *
 * Examples:
 * [object Object],[object Object],[object Object]
 * 
 * Constraints:
 * The `logs` list will contain between 0 and 1000 strings.,Each log line string will have a length between 0 and 200 characters.,The `search_keyword` string will have a length between 0 and 50 characters.,Log lines can contain any printable ASCII characters.,The `[SESSION_START]` and `[SESSION_END]` markers are literal strings to be matched.,Keyword matching for filtering should be case-insensitive.
 *
 * Difficulty: Medium
 */

// ── Stage 1 ──
function extractSessions(logs: string[]): string[][] {
    const SESS_START_MARKER = '[SESSION_START]';
    const SESS_END_MARKER = '[SESSION_END]';

    // Array to store all successfully extracted sessions.
    // Each session is an array of log lines.
    const sessions: string[][] = [];
    // Temporary array to hold log lines for the session currently being built.
    let currentSessionLines: string[] = [];
    // Flag to indicate if we are currently inside an active session.
    let sessionInProgress: boolean = false;

    for (const line of logs) {
        const hasStart = line.includes(SESS_START_MARKER);
        const hasEnd = line.includes(SESS_END_MARKER);

        if (hasStart) {
            // Rule 3: If '[SESSION_START]' is encountered while already in a session,
            // the current session implicitly ends at the line *before* this new start.
            if (sessionInProgress) {
                // Finalize and store the previously active session.
                sessions.push(currentSessionLines);
                // Clear for the new session that is about to begin.
                currentSessionLines = [];
            }
            // Rule 1: A new session always begins with the current '[SESSION_START]' line.
            sessionInProgress = true;
            currentSessionLines.push(line);
        } else if (hasEnd) {
            // Rule 2: If '[SESSION_END]' is encountered while currently in a session,
            // the current session ends.
            if (sessionInProgress) {
                currentSessionLines.push(line); // Include the end marker in the session.
                sessions.push(currentSessionLines); // Finalize and store the session.
                currentSessionLines = []; // Clear for the next potential session.
                sessionInProgress = false; // Session is no longer active.
            }
            // Rule 4: If '[SESSION_END]' is encountered without an active preceding '[SESSION_START]',
            // it should be ignored. This is implicitly handled by the 'else if' condition
            // requiring 'sessionInProgress' to be true.
        } else {
            // No session markers found in this line.
            if (sessionInProgress) {
                // If currently in a session, add the line to the current session.
                currentSessionLines.push(line);
            }
            // If not in a session, the line is outside any session and should be ignored (implicitly handled).
        }
    }

    // Rule 5: Any active session that does not encounter a '[SESSION_END]' marker
    // by the end of the log file is considered complete at the last log entry.
    if (sessionInProgress) {
        sessions.push(currentSessionLines);
    }

    return sessions;
}

// ── Stage 2 ──
function extractAndFilterLogSessions(logs: string[], search_keyword: string): string[][] {
    // This array will store all sessions extracted from the logs before filtering.
    const allExtractedSessions: string[][] = [];
    // This array temporarily holds log entries for the session currently being processed.
    let currentSession: string[] = [];
    // A boolean flag to indicate if we are currently inside an active session.
    let inSession: boolean = false;

    // Convert the search keyword to lower case once to perform case-insensitive matching efficiently.
    const lowerCaseSearchKeyword = search_keyword.toLowerCase();

    // Iterate through each log entry in the provided list.
    for (const logEntry of logs) {
        // Check if the current log entry contains the session start or end markers.
        const isSessionStart = logEntry.includes('[SESSION_START]');
        const isSessionEnd = logEntry.includes('[SESSION_END]');

        // Handle log entries containing '[SESSION_START]'.
        if (isSessionStart) {
            // Rule 3: If '[SESSION_START]' is encountered while already in a session,
            // the current session implicitly ends at the line *before* this new start.
            if (inSession) {
                allExtractedSessions.push(currentSession); // Finalize and store the previous session.
            }
            // Rule 1: A new session begins with the current '[SESSION_START]' line.
            currentSession = [logEntry]; // Initialize new session with this log entry.
            inSession = true; // Mark that we are now in an active session.
        } 
        // Handle log entries containing '[SESSION_END]'.
        else if (isSessionEnd) {
            // Rule 2: If '[SESSION_END]' is encountered while currently in a session,
            // the current session ends.
            if (inSession) {
                currentSession.push(logEntry); // Add the end marker to the session.
                allExtractedSessions.push(currentSession); // Finalize and store the session.
                inSession = false; // Mark that we are no longer in a session.
                currentSession = []; // Clear current session data for the next potential session.
            }
            // Rule 4: If '[SESSION_END]' is encountered without an active preceding '[SESSION_START]',
            // it should be ignored. This is handled implicitly because 'inSession' would be false.
        } 
        // Handle regular log entries (neither start nor end markers).
        else {
            // If currently in a session, add the log entry to the current session.
            if (inSession) {
                currentSession.push(logEntry);
            }
            // If not in a session, this log entry is ignored as it doesn't belong to any active session.
        }
    }

    // Rule 5: Any active session that does not encounter a '[SESSION_END]' marker
    // by the end of the log file is considered complete at the last log entry.
    // Ensure currentSession has content before pushing to avoid empty arrays in case of edge scenarios
    // where a session was implicitly closed by a new start or already ended normally.
    if (inSession && currentSession.length > 0) {
        allExtractedSessions.push(currentSession);
    }

    // Filter the extracted sessions based on the provided 'search_keyword'.
    const filteredSessions: string[][] = [];
    // If the search keyword is empty, any log entry (and thus any session) is considered to contain it.
    // In this case, all extracted sessions should be returned directly.
    if (lowerCaseSearchKeyword.length === 0) {
        return allExtractedSessions;
    }

    // Iterate through all extracted sessions to apply the keyword filter.
    for (const session of allExtractedSessions) {
        let hasKeyword = false;
        // Check each log line within the session for the keyword.
        for (const logLine of session) {
            // Perform case-insensitive search.
            if (logLine.toLowerCase().includes(lowerCaseSearchKeyword)) {
                hasKeyword = true; // Keyword found in this session.
                break; // No need to check further lines in this session.
            }
        }
        // If the keyword was found in any log entry of the session, add the session to the result.
        if (hasKeyword) {
            filteredSessions.push(session);
        }
    }

    return filteredSessions;
}
