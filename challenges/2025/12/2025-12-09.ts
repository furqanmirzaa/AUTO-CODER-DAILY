/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Activity Session Durations
 * 
 * Description:
 * You are given a sorted list of unique positive integers representing user activity timestamps (in minutes). You are also given an integer `max_inactive_duration`.

Activities are grouped into "sessions". A new session begins under two conditions:
1. It's the very first activity.
2. The current activity occurs after a gap of more than `max_inactive_duration` minutes from the *immediately preceding activity in the same session*.

For each completed session, you need to calculate its total duration. The duration of a session is defined as `(last_activity_timestamp - first_activity_timestamp + 1)`.

Return a list of these total durations for all sessions, in the order they conclude.
 * 
 * Examples:
 * [object Object],[object Object],[object Object]
 * 
 * Constraints:
 * 1 <= len(timestamps) <= 10^5,1 <= timestamps[i] <= 10^9,`timestamps` is sorted in ascending order and contains unique elements.,0 <= max_inactive_duration <= 10^9
 * 
 * Difficulty: Medium
 */

To solve the Activity Session Durations problem, we need to iterate through the sorted list of timestamps and maintain state about the current session.

**Approach:**

1.  **Initialization**:
    *   We'll use an array `sessionDurations` to store the calculated durations.
    *   If the input `timestamps` array is empty, return an empty `sessionDurations` array immediately.
    *   For the first activity (at `timestamps[0]`), it always starts a new session. We store this as `currentSessionStartTime`.
    *   We also need to track the `previousActivityTimeInCurrentSession` to check for gaps. Initially, this is also `timestamps[0]`.

2.  **Iterate and Group**:
    *   Loop through the `timestamps` array starting from the second activity (`i = 1`).
    *   For each `currentActivityTime`, calculate the gap with the `previousActivityTimeInCurrentSession`.
    *   **Condition for New Session**: If `(currentActivityTime - previousActivityTimeInCurrentSession)` is `> max_inactive_duration`, it means the current activity begins a new session.
        *   Before starting a new session, the *previous* session has just concluded. Calculate its duration using `(previousActivityTimeInCurrentSession - currentSessionStartTime + 1)` and add it to `sessionDurations`.
        *   Then, reset `currentSessionStartTime` to the `currentActivityTime`.
    *   **Update Previous Activity**: Regardless of whether a new session started or not, update `previousActivityTimeInCurrentSession` to `currentActivityTime`. This ensures that for the next iteration, we compare with the most recent activity within the ongoing session.

3.  **Final Session**:
    *   After the loop finishes, there will always be one uncompleted session (the last one being built). Calculate its duration using the final `previousActivityTimeInCurrentSession` (which will be `timestamps[timestamps.length - 1]`) and the `currentSessionStartTime` for that last session. Add this duration to `sessionDurations`.

4.  **Return**: Return the `sessionDurations` array.

**Time Complexity:**
The algorithm processes each timestamp exactly once in a single loop. Each operation inside the loop (subtraction, comparison, assignment, array push) takes constant time. Therefore, the time complexity is O(N), where N is the number of timestamps.

**Space Complexity:**
We store the calculated session durations in the `sessionDurations` array. In the worst case (e.g., when `max_inactive_duration` is 0), each activity forms its own session, resulting in N durations. Thus, the space complexity is O(N) for storing the results. Excluding the output space, the auxiliary space used is O(1) as we only keep track of a few variables.

function getSessionDurations(timestamps: number[], max_inactive_duration: number): number[] {
    const sessionDurations: number[] = [];

    // Edge case: If there are no activities, no sessions can be formed.
    if (timestamps.length === 0) {
        return sessionDurations;
    }

    // The first activity always starts a new session.
    let currentSessionStartTime: number = timestamps[0];
    // This tracks the timestamp of the last activity within the *current* session being built.
    // It's used to check the gap for the *next* incoming activity.
    let previousActivityTimeInCurrentSession: number = timestamps[0];

    // Iterate through the timestamps starting from the second activity.
    for (let i = 1; i < timestamps.length; i++) {
        const currentActivityTime: number = timestamps[i];

        // Condition for starting a new session:
        // The gap between the current activity and the immediately preceding activity
        // in the current session is *more than* max_inactive_duration.
        if (currentActivityTime - previousActivityTimeInCurrentSession > max_inactive_duration) {
            // A new session is about to begin, so the current session has concluded.
            // Calculate and store its duration.
            const sessionDuration = previousActivityTimeInCurrentSession - currentSessionStartTime + 1;
            sessionDurations.push(sessionDuration);

            // Start a new session with the current activity.
            currentSessionStartTime = currentActivityTime;
        }
        
        // Update the previous activity time for the *current* (or newly started) session.
        // This activity is now the latest one considered for the session in progress.
        previousActivityTimeInCurrentSession = currentActivityTime;
    }

    // After the loop, there will always be one session that hasn't been added to `sessionDurations` yet
    // (the very last session that was active or newly started at the end of the input).
    // Calculate its duration and add it to the results.
    const lastSessionDuration = previousActivityTimeInCurrentSession - currentSessionStartTime + 1;
    sessionDurations.push(lastSessionDuration);

    return sessionDurations;
}

// Test Cases
function runTests() {
    console.log("Running tests...");

    // Helper function for asserting array equality in tests
    function assertArrayEquals(actual: number[], expected: number[], message: string) {
        if (actual.length !== expected.length || !actual.every((val, i) => val === expected[i])) {
            console.error(`FAIL: ${message}`);
            console.error(`  Expected: [${expected}]`);
            console.error(`  Actual:   [${actual}]`);
        } else {
            console.log(`PASS: ${message}`);
        }
    }

    // Example 1 from problem description
    assertArrayEquals(
        getSessionDurations([1, 2, 3, 7, 8, 12, 13, 14], 2),
        [3, 2, 3],
        "Example 1: Mixed gaps, multiple sessions"
    );

    // Example 2 from problem description
    assertArrayEquals(
        getSessionDurations([10, 20, 30, 40], 5),
        [1, 1, 1, 1], // Gaps are 10, all > 5. Each activity is a session.
        "Example 2: All activities far apart, small max_inactive_duration"
    );

    // Example 3 from problem description
    assertArrayEquals(
        getSessionDurations([100, 105, 110, 115], 10),
        [16], // Gaps are 5, all <= 10. All activities form one session. (115 - 100 + 1)
        "Example 3: All activities within one session, large enough max_inactive_duration"
    );

    // Additional Test Cases

    // Case 1: Empty timestamps array
    assertArrayEquals(
        getSessionDurations([], 100),
        [],
        "Case 1: Empty timestamps array"
    );

    // Case 2: Single timestamp
    assertArrayEquals(
        getSessionDurations([50], 0),
        [1],
        "Case 2: Single timestamp (duration is 1)"
    );

    // Case 3: max_inactive_duration = 0 (any gap > 0 starts new session)
    assertArrayEquals(
        getSessionDurations([1, 2, 3, 4], 0),
        [1, 1, 1, 1], // Gaps are 1, all > 0. Each activity is a session.
        "Case 3: max_inactive_duration = 0, all separate sessions"
    );

    // Case 4: Very large max_inactive_duration (all activities should be in one session)
    assertArrayEquals(
        getSessionDurations([1, 5, 10, 15], 1000),
        [15], // (15 - 1 + 1)
        "Case 4: Very large max_inactive_duration, all activities in a single session"
    );

    // Case 5: Timestamps with varying gaps and strict max_inactive_duration
    assertArrayEquals(
        getSessionDurations([1, 5, 6, 7, 12, 15, 16, 20], 3),
        [1, 3, 5, 1],
        "Case 5: Timestamps with varying gaps and strict max_inactive_duration (gaps: 4,1,1,5,3,1,4)"
        // Trace:
        // [1] -> Gap 4 (>3) -> Session [1] duration 1. New session [5]
        // [5,6,7] -> Gap 5 (>3) -> Session [5,6,7] duration (7-5+1)=3. New session [12]
        // [12,15,16] -> Gap 4 (>3) -> Session [12,15,16] duration (16-12+1)=5. New session [20]
        // [20] -> End of input -> Session [20] duration 1.
    );

    // Case 6: Boundary condition - gap is exactly equal to max_inactive_duration (should NOT break session)
    assertArrayEquals(
        getSessionDurations([1, 3, 5, 7], 2),
        [7], // Gaps are 2, 2, 2. None are > 2. All form one session (7-1+1).
        "Case 6: Gap exactly equals max_inactive_duration (should not break session)"
    );

    // Case 7: Boundary condition - gap is just one more than max_inactive_duration (should break session)
    assertArrayEquals(
        getSessionDurations([1, 4, 7, 10], 2),
        [1, 1, 1, 1], // Gaps are 3, 3, 3. All are > 2. Each activity forms a session.
        "Case 7: Gap just more than max_inactive_duration (should break session)"
    );

    console.log("All tests finished.");
}

// Uncomment the line below to run the tests
runTests();

// Run the solution
console.log('Running daily challenge solution...');
