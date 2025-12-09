/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Event Sequence Anomaly Detector
 *
 * Description:
 * You are tasked with building a system to detect unusual activity patterns in application logs. Each log entry records a specific user performing an action at a certain time. An anomaly is defined as a user performing a *minimum number* of *distinct event types* within a *specific time window*.

Your program should process a stream of log entries (which are not necessarily sorted by timestamp, but will be processed effectively as if they were). For each log entry, you should update the user's activity history. If processing any log entry causes a user to meet the anomaly criteria, that user should be identified and added to a list of anomalous users.

Once a user is identified as anomalous, they should not be reported again for subsequent anomalies.

**Input:**
- `logs`: A list of strings, where each string represents a log entry in the format "timestamp,user_id,event_type".
  - `timestamp`: Integer, seconds since epoch.
  - `user_id`: String.
  - `event_type`: String.
- `window_seconds`: Integer, the size of the time window in seconds.
- `min_distinct_events`: Integer, the minimum number of distinct event types required to trigger an anomaly.

**Output:**
- A list of `user_id`s who have exhibited anomalous behavior, sorted alphabetically. Each user should appear only once in the output, even if they have multiple anomalous sequences.
 *
 * Examples:
 * [object Object],[object Object]
 * 
 * Constraints:
 * 1 <= len(logs) <= 10^5,Each log entry is a string "timestamp,user_id,event_type".,timestamp: integer, 1 <= timestamp <= 10^9,user_id: string, alphanumeric, 1 <= len(user_id) <= 20,event_type: string, alphanumeric, 1 <= len(event_type) <= 30,1 <= window_seconds <= 10^9,1 <= min_distinct_events <= 100,The input `logs` list is not guaranteed to be sorted by timestamp. Your solution should correctly handle this (e.g., by sorting logs first, or by using appropriate data structures for each user).,Output `user_id`s should be sorted alphabetically and unique.
 *
 * Difficulty: Medium
 */

// ── Stage 1 ──
interface LogEntry {
    timestamp: number;
    userId: string;
    eventType: string;
}

interface UserActivityState {
    // Stores all relevant events for a user, sorted by timestamp.
    // Since parsedLogs are sorted globally, adding to this array maintains per-user chronological order.
    events: LogEntry[];
    
    // Index of the first event in 'events' that is potentially within the current active time window.
    // This pointer allows efficient 'pruning' of old events without shifting array elements.
    windowStartIndex: number;
}

function detectAnomaly(
    logs: string[],
    window_seconds: number,
    min_distinct_events: number
): string[] {
    // 1. Parse and Sort Logs
    // It is crucial to sort all log entries by timestamp first because the input 'logs' list is not guaranteed to be sorted.
    // This ensures that when we process events for a user, we consider them in chronological order across all users,
    // which is vital for correctly managing time windows.
    const parsedLogs: LogEntry[] = logs.map(log => {
        const parts = log.split(',');
        return {
            timestamp: parseInt(parts[0], 10), // Parse timestamp as an integer
            userId: parts[1],
            eventType: parts[2],
        };
    });

    // Sort all log entries by their timestamp in ascending order.
    parsedLogs.sort((a, b) => a.timestamp - b.timestamp);

    // userActivity: Map to store the activity history for each user.
    // Key: user_id (string)
    // Value: UserActivityState object containing their events and a pointer for window management.
    const userActivity = new Map<string, UserActivityState>();

    // anomalousUsers: Set to store user_ids that have been identified as anomalous.
    // Using a Set automatically handles uniqueness and prevents re-reporting the same user.
    const anomalousUsers = new Set<string>();

    // 2. Process Sorted Logs
    // Iterate through each log entry in chronological order.
    for (const logEntry of parsedLogs) {
        const { timestamp, userId, eventType } = logEntry;

        // If this user has already been identified as anomalous, skip further processing for them
        // as per the requirement: "Once a user is identified as anomalous, they should not be reported again."
        if (anomalousUsers.has(userId)) {
            continue;
        }

        // Get or initialize the activity state for the current user.
        let userState = userActivity.get(userId);
        if (!userState) {
            // If the user is new, create a new state object for them.
            userState = { events: [], windowStartIndex: 0 };
            userActivity.set(userId, userState);
        }

        // Add the current log entry to the user's history.
        // Since the overall `parsedLogs` are sorted, pushing to `userState.events` maintains its chronological order.
        userState.events.push(logEntry);

        // Determine the start time of the current time window.
        // Any event with a timestamp strictly less than `windowStartTime` is outside this window.
        const windowStartTime = timestamp - window_seconds;

        // 3. Prune old events from the start of the window (conceptually)
        // Advance `windowStartIndex` past any events that are now outside the `windowStartTime`.
        // This effectively implements a sliding window. `windowStartIndex` only moves forward,
        // making this an amortized O(1) operation over all events for a user.
        while (
            userState.windowStartIndex < userState.events.length &&
            userState.events[userState.windowStartIndex].timestamp < windowStartTime
        ) {
            userState.windowStartIndex++;
        }

        // 4. Count distinct event types within the current window
        // Initialize a Set to store distinct event types. Sets automatically handle uniqueness.
        const distinctEventTypes = new Set<string>();
        
        // Iterate through events for the user, starting from `windowStartIndex` (the first event in the window).
        // and add their event types to the `distinctEventTypes` Set.
        for (let i = userState.windowStartIndex; i < userState.events.length; i++) {
            distinctEventTypes.add(userState.events[i].eventType);
        }

        // 5. Check for anomaly criteria
        // If the number of distinct event types in the current window meets or exceeds `min_distinct_events`,
        // then the user is considered anomalous.
        if (distinctEventTypes.size >= min_distinct_events) {
            anomalousUsers.add(userId);
        }
    }

    // 6. Prepare final output
    // Convert the Set of anomalous user IDs to an array and sort it alphabetically
    // as required by the problem description.
    const result = Array.from(anomalousUsers).sort((a, b) => a.localeCompare(b));

    return result;
}
