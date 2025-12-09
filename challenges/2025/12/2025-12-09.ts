/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Log Entry Aggregator
 * 
 * Description:
 * You are given a chronologically ordered list of log entries. Each log entry consists of a timestamp and a message. Your task is to aggregate consecutive log entries that share the exact same message into a single 'block' entry. For each block, you need to record the common message, the timestamp of the first entry in the block (start time), the timestamp of the last entry in the block (end time), and the total duration of the block (end time - start time).
 * 
 * Examples:
 * [object Object],[object Object],[object Object],[object Object]
 * 
 * Constraints:
 * [object Object]
 * 
 * Difficulty: Medium
 */

/**
 * Represents a single log entry.
 * @interface
 */
interface LogEntry {
  /** The timestamp of the log entry (e.g., Unix timestamp, milliseconds since epoch). */
  timestamp: number;
  /** The message associated with the log entry. */
  message: string;
}

/**
 * Represents an aggregated block of consecutive log entries sharing the same message.
 * @interface
 */
interface AggregatedBlock {
  /** The common message for all entries within this block. */
  message: string;
  /** The timestamp of the first log entry in this block. */
  startTime: number;
  /** The timestamp of the last log entry in this block. */
  endTime: number;
  /** The duration of the block, calculated as `endTime - startTime`. */
  duration: number;
}

/**
 * Aggregates a chronologically ordered list of log entries into blocks.
 * Consecutive log entries that share the exact same message are grouped into a single block.
 * Each block records the common message, its start time, end time, and total duration.
 *
 * @param {LogEntry[]} logs - A chronologically ordered list of log entries.
 * @returns {AggregatedBlock[]} A list of aggregated log blocks.
 */
function aggregateLogEntries(logs: LogEntry[]): AggregatedBlock[] {
  const aggregatedBlocks: AggregatedBlock[] = [];

  // Handle empty input list gracefully.
  if (logs.length === 0) {
    return aggregatedBlocks;
  }

  // Initialize the first block with the first log entry.
  let currentBlock: AggregatedBlock = {
    message: logs[0].message,
    startTime: logs[0].timestamp,
    endTime: logs[0].timestamp,
    duration: 0, // Duration will be calculated when the block is finalized.
  };

  // Iterate through the log entries starting from the second one.
  for (let i = 1; i < logs.length; i++) {
    const entry = logs[i];

    // If the current entry's message matches the current block's message, extend the block.
    if (entry.message === currentBlock.message) {
      currentBlock.endTime = entry.timestamp;
    } else {
      // If the message is different, the current block has ended.
      // Finalize its duration and add it to the results.
      currentBlock.duration = currentBlock.endTime - currentBlock.startTime;
      aggregatedBlocks.push(currentBlock);

      // Start a new block with the current entry.
      currentBlock = {
        message: entry.message,
        startTime: entry.timestamp,
        endTime: entry.timestamp,
        duration: 0,
      };
    }
  }

  // After the loop, add the very last block to the results.
  // Its duration needs to be calculated before pushing.
  currentBlock.duration = currentBlock.endTime - currentBlock.startTime;
  aggregatedBlocks.push(currentBlock);

  return aggregatedBlocks;
}

// --- Test Cases ---

function assertDeepEqual(actual: any, expected: any, message: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`   Expected: ${expectedStr}`);
    console.error(`   Actual:   ${actualStr}`);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("--- Running Test Cases ---");

// Test Case 1: Empty list
const testLogs1: LogEntry[] = [];
const expected1: AggregatedBlock[] = [];
assertDeepEqual(aggregateLogEntries(testLogs1), expected1, "should return an empty array for an empty input list");

// Test Case 2: Single log entry
const testLogs2: LogEntry[] = [
  { timestamp: 100, message: "Server started" },
];
const expected2: AggregatedBlock[] = [
  { message: "Server started", startTime: 100, endTime: 100, duration: 0 },
];
assertDeepEqual(aggregateLogEntries(testLogs2), expected2, "should correctly aggregate a single log entry");

// Test Case 3: Multiple entries with the same message
const testLogs3: LogEntry[] = [
  { timestamp: 100, message: "Heartbeat" },
  { timestamp: 105, message: "Heartbeat" },
  { timestamp: 110, message: "Heartbeat" },
];
const expected3: AggregatedBlock[] = [
  { message: "Heartbeat", startTime: 100, endTime: 110, duration: 10 },
];
assertDeepEqual(aggregateLogEntries(testLogs3), expected3, "should aggregate multiple consecutive identical messages into one block");

// Test Case 4: Multiple entries with different messages (each forms its own block)
const testLogs4: LogEntry[] = [
  { timestamp: 100, message: "A" },
  { timestamp: 101, message: "B" },
  { timestamp: 102, message: "C" },
];
const expected4: AggregatedBlock[] = [
  { message: "A", startTime: 100, endTime: 100, duration: 0 },
  { message: "B", startTime: 101, endTime: 101, duration: 0 },
  { message: "C", startTime: 102, endTime: 102, duration: 0 },
];
assertDeepEqual(aggregateLogEntries(testLogs4), expected4, "should create a new block for each different message");

// Test Case 5: Mixed messages, some consecutive, some distinct
const testLogs5: LogEntry[] = [
  { timestamp: 100, message: "Processing request" },
  { timestamp: 105, message: "Processing request" },
  { timestamp: 110, message: "Database query" },
  { timestamp: 115, message: "Processing request" },
  { timestamp: 120, message: "Processing request" },
  { timestamp: 125, message: "Finished" },
];
const expected5: AggregatedBlock[] = [
  { message: "Processing request", startTime: 100, endTime: 105, duration: 5 },
  { message: "Database query", startTime: 110, endTime: 110, duration: 0 },
  { message: "Processing request", startTime: 115, endTime: 120, duration: 5 },
  { message: "Finished", startTime: 125, endTime: 125, duration: 0 },
];
assertDeepEqual(aggregateLogEntries(testLogs5), expected5, "should correctly aggregate mixed consecutive and distinct messages");

// Test Case 6: Messages with leading/trailing spaces (should be treated as different)
const testLogs6: LogEntry[] = [
  { timestamp: 100, message: " Message " },
  { timestamp: 105, message: "Message" },
  { timestamp: 110, message: " Message " },
];
const expected6: AggregatedBlock[] = [
  { message: " Message ", startTime: 100, endTime: 100, duration: 0 },
  { message: "Message", startTime: 105, endTime: 105, duration: 0 },
  { message: " Message ", startTime: 110, endTime: 110, duration: 0 },
];
assertDeepEqual(aggregateLogEntries(testLogs6), expected6, "should distinguish messages based on exact string match, including spaces");

// Test Case 7: Longer sequence of identical messages
const testLogs7: LogEntry[] = [
  { timestamp: 1, message: "Keepalive" },
  { timestamp: 2, message: "Keepalive" },
  { timestamp: 3, message: "Keepalive" },
  { timestamp: 4, message: "Keepalive" },
  { timestamp: 5, message: "Keepalive" },
];
const expected7: AggregatedBlock[] = [
  { message: "Keepalive", startTime: 1, endTime: 5, duration: 4 },
];
assertDeepEqual(aggregateLogEntries(testLogs7), expected7, "should handle a long sequence of identical messages");

console.log("--- End of Test Cases ---");


/**
 * Brief Explanation of the Approach:
 *
 * The solution uses a single pass (iteration) through the chronologically ordered list of log entries.
 * It maintains a `currentBlock` object which represents the block being actively built.
 *
 * 1.  Initialization:
 *     - If the input `logs` array is empty, an empty array is returned immediately.
 *     - Otherwise, the `currentBlock` is initialized using the very first log entry. Its `startTime` and `endTime` are both set to the first entry's timestamp, and `duration` is temporarily 0.
 *
 * 2.  Iteration:
 *     - The algorithm then iterates from the second log entry (`i = 1`) to the end of the list.
 *     - For each `entry`:
 *         - If `entry.message` is *the same as* `currentBlock.message`:
 *             - The `currentBlock` is extended by simply updating its `endTime` to the `entry.timestamp`.
 *         - If `entry.message` is *different from* `currentBlock.message`:
 *             - This signifies the end of the `currentBlock`. Its `duration` is calculated (`endTime - startTime`).
 *             - The finalized `currentBlock` is added to the `aggregatedBlocks` result array.
 *             - A *new* `currentBlock` is then started, initialized with the current `entry`'s message, `startTime`, and `endTime` (both set to `entry.timestamp`).
 *
 * 3.  Finalization:
 *     - After the loop finishes, there will always be one last `currentBlock` that has not yet been added to the `aggregatedBlocks` array.
 *     - Its `duration` is calculated, and it is pushed into the `aggregatedBlocks` array.
 *     - The `aggregatedBlocks` array is then returned.
 */

/**
 * Time and Space Complexity Analysis:
 *
 * Time Complexity: O(N)
 * - The algorithm iterates through the input `logs` array exactly once.
 * - Inside the loop, all operations (comparisons, assignments, object property access, object creation) take constant time, O(1).
 * - Therefore, the total time complexity is directly proportional to the number of log entries, N.
 *
 * Space Complexity: O(N)
 * - In the worst-case scenario, every log entry has a unique message, or messages alternate frequently (e.g., A, B, A, B...). In this case, each log entry will result in a new `AggregatedBlock` being created and stored in the `aggregatedBlocks` array.
 * - The `aggregatedBlocks` array can grow up to a size of N (where N is the number of input log entries).
 * - Each `AggregatedBlock` object stores a string (message) and three numbers (`startTime`, `endTime`, `duration`). The space for these is constant per block (assuming message string storage is amortized or relatively small compared to N).
 * - Hence, the total space required for the output array and `currentBlock` variable is proportional to the number of input log entries.
 */

// Run the solution
console.log('Running daily challenge solution...');
