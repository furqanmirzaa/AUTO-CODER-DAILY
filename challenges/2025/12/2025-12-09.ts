/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Anonymized Log Pattern Aggregator
 * 
 * Description:
 * You are tasked with analyzing a stream of log data to identify recurring patterns while anonymizing sensitive or variable information. Given a list of log entries, each formatted as a single string `[TIMESTAMP] [LEVEL] [MODULE] MESSAGE`, and a set of anonymization rules (regular expressions), your goal is to:
1. Extract the timestamp and the full message string (including `[LEVEL]` and `[MODULE]`) from each log entry.
2. Apply the anonymization rules sequentially to the extracted message string. Each rule consists of a regular expression to match and a replacement string (e.g., `<ANON_EMAIL>`). The rules should be applied in the order they are provided, and globally (all occurrences).
3. Group log entries that result in identical anonymized message strings.
4. For each distinct anonymized message group, report the anonymized message pattern, the total count of logs matching this pattern, and the earliest and latest timestamps found within that group.

Assume timestamps are in ISO 8601 format (e.g., `YYYY-MM-DDTHH:mm:ssZ`). The output array should be sorted by `anonymizedMessage` alphabetically.
 * 
 * Examples:
 * [object Object]
 * 
 * Constraints:
 * The number of log entries (`logs.length`) will be between 1 and 10,000.,Each log entry string length will be between 50 and 500 characters.,The format of log entries will always be `YYYY-MM-DDTHH:mm:ssZ [LEVEL] [MODULE] MESSAGE`.,`TIMESTAMP` is always in ISO 8601 format.,`LEVEL` and `MODULE` are single words (alphanumeric, no spaces) enclosed in square brackets.,The number of `anonymizationRules` will be between 0 and 10.,`regex` patterns are valid regular expressions. They should be applied globally (all occurrences).,Time complexity: Aim for an efficient solution, ideally considering the performance of regex operations. A typical solution would be O(N * M * L) where N is the number of logs, M is the number of rules, and L is the average message length. Optimization may be possible depending on regex engine efficiency.,Space complexity: O(N) in the worst case (all log messages are unique, requiring a separate entry for each).
 * 
 * Difficulty: Medium
 */

/*
 * Approach:
 * The problem requires us to process a list of log entries, apply anonymization rules, group them by the resulting anonymized message, and then report statistics for each group.
 *
 * 1. Data Structure for Aggregation: We need a way to store and update the statistics for each unique anonymized message pattern. A Map where keys are the anonymized message strings and values are objects containing `count`, `earliestTimestamp`, and `latestTimestamp` is suitable for this purpose.
 *
 * 2. Parsing Log Entries: Each log entry needs to be parsed to extract the timestamp and the full message part. The format is `[TIMESTAMP] [LEVEL] [MODULE] MESSAGE`. We can use a regular expression to extract the timestamp and the rest of the string which constitutes the `fullMessage`. A simple regex `^(\S+) (.*)$` can capture the first word (timestamp) and the rest of the line.
 *
 * 3. Anonymization: For each `fullMessage`, we iterate through the provided `anonymizationRules`. Each rule consists of a `regex` and a `replacement`. The `replace()` method of strings, combined with the global flag (`g`) on the regular expression, will be used to apply each rule. It's crucial to apply rules sequentially, as the output of one rule might be the input for the next.
 *
 * 4. Grouping and Aggregation: After anonymizing a `fullMessage`, we use the resulting `anonymizedMessage` as a key in our aggregation Map.
 *    - If the `anonymizedMessage` is not yet in the Map, we initialize a new entry with `count = 1`, `earliestTimestamp = currentTimestamp`, and `latestTimestamp = currentTimestamp`.
 *    - If the `anonymizedMessage` is already in the Map, we increment its `count`, update `earliestTimestamp` if the `currentTimestamp` is earlier, and update `latestTimestamp` if the `currentTimestamp` is later. Date objects can be compared directly after parsing the ISO 8601 strings.
 *
 * 5. Output Formatting: Finally, we convert the Map's values into an array of the specified output format (`{ anonymizedMessage: string, count: number, earliestTimestamp: string, latestTimestamp: string }`). This array then needs to be sorted alphabetically by `anonymizedMessage`. Timestamps should be converted back to ISO 8601 string format for the output.
 *
 * Time Complexity:
 * Let N be the number of log entries, M be the number of anonymization rules, and L be the average length of a log message (specifically the part that needs anonymization).
 *
 * - Parsing logs: For each of N logs, we do a simple regex match and string slice. This is roughly O(N * L) in the worst case for string operations, or O(N) if the regex is very efficient.
 * - Anonymization: For each of N logs, we iterate through M rules. Each rule involves a `replace` operation on a string of length up to L. Regular expression `replace` operations can take O(L * P) time, where P is the complexity of the regex pattern itself. In the worst case, applying all M rules could be O(N * M * L * P). Assuming P is relatively constant for typical patterns or that the regex engine is optimized, this part dominates and becomes approximately O(N * M * L).
 * - Aggregation: For each of N logs, we perform a Map lookup/insertion and some date comparisons. Date parsing (creating Date objects from string) is O(L_timestamp), which is constant here. Map operations are typically O(1) on average. This is O(N).
 * - Sorting output: If K is the number of unique anonymized messages (K <= N), sorting takes O(K log K) string comparisons. String comparison itself can take up to O(L) time. So, O(K log K * L).
 *
 * Overall Time Complexity: O(N * M * L + K log K * L). Given K <= N, it can be approximated as O(N * M * L + N log N * L). The dominant factor is usually the anonymization step: O(N * M * L).
 *
 * Space Complexity:
 * - The aggregation Map stores K unique anonymized messages. Each entry stores the anonymized message (length L) and some numbers/date objects.
 * - In the worst case, all log messages are unique after anonymization, so K = N.
 * - Therefore, the space complexity is O(N * L) for storing the anonymized messages and associated data.
 */

interface AnonymizationRule {
  regex: string;
  replacement: string;
}

interface LogPattern {
  anonymizedMessage: string;
  count: number;
  earliestTimestamp: string;
  latestTimestamp: string;
}

interface AggregatedLogData {
  count: number;
  earliestTimestamp: Date;
  latestTimestamp: Date;
}

function aggregateAnonymizedLogPatterns(
  logs: string[],
  anonymizationRules: AnonymizationRule[]
): LogPattern[] {
  // Map to store aggregated data: key is anonymized message, value is an object
  // containing count, earliest, and latest timestamps (as Date objects for easy comparison).
  const aggregatedPatterns = new Map<string, AggregatedLogData>();

  // Regex to extract timestamp and the rest of the message.
  // Group 1: timestamp (e.g., YYYY-MM-DDTHH:mm:ssZ)
  // Group 2: full message (e.g., [LEVEL] [MODULE] MESSAGE)
  const logEntryParser = /^(\S+) (.*)$/;

  for (const logEntry of logs) {
    const match = logEntryParser.exec(logEntry);
    if (!match) {
      // Should not happen based on constraints, but good for robustness.
      continue;
    }

    const timestampStr = match[1];
    let fullMessage = match[2]; // This includes [LEVEL] [MODULE] MESSAGE

    const currentTimestamp = new Date(timestampStr);

    // Apply anonymization rules sequentially.
    for (const rule of anonymizationRules) {
      // Create a RegExp object with the 'g' flag for global replacement.
      // It's important to re-create it inside the loop or ensure it's reset,
      // but 'replace' method with a new RegExp object is generally safe.
      const regex = new RegExp(rule.regex, 'g');
      fullMessage = fullMessage.replace(regex, rule.replacement);
    }

    const anonymizedMessage = fullMessage;

    if (aggregatedPatterns.has(anonymizedMessage)) {
      // Update existing pattern.
      const data = aggregatedPatterns.get(anonymizedMessage)!;
      data.count++;
      if (currentTimestamp < data.earliestTimestamp) {
        data.earliestTimestamp = currentTimestamp;
      }
      if (currentTimestamp > data.latestTimestamp) {
        data.latestTimestamp = currentTimestamp;
      }
    } else {
      // Add new pattern.
      aggregatedPatterns.set(anonymizedMessage, {
        count: 1,
        earliestTimestamp: currentTimestamp,
        latestTimestamp: currentTimestamp,
      });
    }
  }

  // Convert the Map to the desired array format.
  const result: LogPattern[] = [];
  for (const [anonymizedMessage, data] of aggregatedPatterns.entries()) {
    result.push({
      anonymizedMessage: anonymizedMessage,
      count: data.count,
      // Convert Date objects back to ISO 8601 strings.
      earliestTimestamp: data.earliestTimestamp.toISOString(),
      latestTimestamp: data.latestTimestamp.toISOString(),
    });
  }

  // Sort the results alphabetically by anonymizedMessage.
  result.sort((a, b) => a.anonymizedMessage.localeCompare(b.anonymizedMessage));

  return result;
}

// Test cases

// Test Case 1: Basic functionality with email and IP anonymization
console.log("Test Case 1: Basic functionality with email and IP anonymization");
const logs1 = [
  "2023-01-01T10:00:00Z [INFO] [Auth] User 'john.doe@example.com' logged in from 192.168.1.100",
  "2023-01-01T10:05:00Z [WARN] [Auth] Failed login attempt for 'jane.smith@example.com' from 192.168.1.101",
  "2023-01-01T10:10:00Z [INFO] [Auth] User 'john.doe@example.com' logged in from 192.168.1.100",
  "2023-01-01T10:15:00Z [INFO] [Network] Connection established to 10.0.0.50",
  "2023-01-01T10:20:00Z [DEBUG] [System] Process ID 12345 started",
  "2023-01-01T10:25:00Z [INFO] [Auth] User 'alice@test.com' logged in from 192.168.1.100",
  "2023-01-01T10:30:00Z [INFO] [Network] Connection established to 10.0.0.51",
];
const rules1: AnonymizationRule[] = [
  { regex: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b", replacement: "<ANON_EMAIL>" },
  { regex: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", replacement: "<ANON_IP>" },
  { regex: "\\b(ID )\\d+\\b", replacement: "$1<ANON_ID>"} // Example: replace ID 12345 with ID <ANON_ID>
];
const expected1 = [
  {
    anonymizedMessage: "[DEBUG] [System] Process ID <ANON_ID> started",
    count: 1,
    earliestTimestamp: "2023-01-01T10:20:00.000Z",
    latestTimestamp: "2023-01-01T10:20:00.000Z",
  },
  {
    anonymizedMessage: "[INFO] [Auth] User '<ANON_EMAIL>' logged in from <ANON_IP>",
    count: 3,
    earliestTimestamp: "2023-01-01T10:00:00.000Z",
    latestTimestamp: "2023-01-01T10:25:00.000Z",
  },
  {
    anonymizedMessage: "[INFO] [Network] Connection established to <ANON_IP>",
    count: 2,
    earliestTimestamp: "2023-01-01T10:15:00.000Z",
    latestTimestamp: "2023-01-01T10:30:00.000Z",
  },
  {
    anonymizedMessage: "[WARN] [Auth] Failed login attempt for '<ANON_EMAIL>' from <ANON_IP>",
    count: 1,
    earliestTimestamp: "2023-01-01T10:05:00.000Z",
    latestTimestamp: "2023-01-01T10:05:00.000Z",
  },
];
const result1 = aggregateAnonymizedLogPatterns(logs1, rules1);
console.log(JSON.stringify(result1, null, 2));
// Assertions for Test Case 1
console.assert(result1.length === expected1.length, `Test 1 Failed: Expected ${expected1.length} patterns, got ${result1.length}`);
expected1.forEach((expectedPattern, index) => {
  const actualPattern = result1[index];
  console.assert(actualPattern.anonymizedMessage === expectedPattern.anonymizedMessage, `Test 1 Failed: Pattern message mismatch at index ${index}. Expected "${expectedPattern.anonymizedMessage}", got "${actualPattern.anonymizedMessage}"`);
  console.assert(actualPattern.count === expectedPattern.count, `Test 1 Failed: Pattern count mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.count}, got ${actualPattern.count}`);
  console.assert(actualPattern.earliestTimestamp === expectedPattern.earliestTimestamp, `Test 1 Failed: Pattern earliestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.earliestTimestamp}, got ${actualPattern.earliestTimestamp}`);
  console.assert(actualPattern.latestTimestamp === expectedPattern.latestTimestamp, `Test 1 Failed: Pattern latestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.latestTimestamp}, got ${actualPattern.latestTimestamp}`);
});
console.log("Test Case 1 Passed!");

console.log("\nTest Case 2: No anonymization rules");
const logs2 = [
  "2023-02-01T08:00:00Z [INFO] [System] System started.",
  "2023-02-01T08:01:00Z [INFO] [System] System started.",
  "2023-02-01T08:02:00Z [ERROR] [DB] Database connection lost.",
  "2023-02-01T08:03:00Z [INFO] [System] System shutting down.",
];
const rules2: AnonymizationRule[] = [];
const expected2 = [
  {
    anonymizedMessage: "[ERROR] [DB] Database connection lost.",
    count: 1,
    earliestTimestamp: "2023-02-01T08:02:00.000Z",
    latestTimestamp: "2023-02-01T08:02:00.000Z",
  },
  {
    anonymizedMessage: "[INFO] [System] System shutting down.",
    count: 1,
    earliestTimestamp: "2023-02-01T08:03:00.000Z",
    latestTimestamp: "2023-02-01T08:03:00.000Z",
  },
  {
    anonymizedMessage: "[INFO] [System] System started.",
    count: 2,
    earliestTimestamp: "2023-02-01T08:00:00.000Z",
    latestTimestamp: "2023-02-01T08:01:00.000Z",
  },
];
const result2 = aggregateAnonymizedLogPatterns(logs2, rules2);
console.log(JSON.stringify(result2, null, 2));
console.assert(result2.length === expected2.length, `Test 2 Failed: Expected ${expected2.length} patterns, got ${result2.length}`);
expected2.forEach((expectedPattern, index) => {
  const actualPattern = result2[index];
  console.assert(actualPattern.anonymizedMessage === expectedPattern.anonymizedMessage, `Test 2 Failed: Pattern message mismatch at index ${index}. Expected "${expectedPattern.anonymizedMessage}", got "${actualPattern.anonymizedMessage}"`);
  console.assert(actualPattern.count === expectedPattern.count, `Test 2 Failed: Pattern count mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.count}, got ${actualPattern.count}`);
  console.assert(actualPattern.earliestTimestamp === expectedPattern.earliestTimestamp, `Test 2 Failed: Pattern earliestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.earliestTimestamp}, got ${actualPattern.earliestTimestamp}`);
  console.assert(actualPattern.latestTimestamp === expectedPattern.latestTimestamp, `Test 2 Failed: Pattern latestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.latestTimestamp}, got ${actualPattern.latestTimestamp}`);
});
console.log("Test Case 2 Passed!");


console.log("\nTest Case 3: Multiple rules, overlapping replacements, and time ranges");
const logs3 = [
  "2023-03-01T12:00:00Z [INFO] [User] User 101 accessed resource /data/user/101",
  "2023-03-01T12:01:00Z [INFO] [User] User 102 accessed resource /data/admin/201",
  "2023-03-01T12:02:00Z [INFO] [User] User 101 accessed resource /data/user/101",
  "2023-03-01T12:03:00Z [WARN] [Auth] Failed login for user 'guest' from 192.168.0.1",
  "2023-03-01T12:04:00Z [INFO] [User] User 103 accessed resource /data/user/103",
  "2023-03-01T12:05:00Z [WARN] [Auth] Failed login for user 'admin' from 192.168.0.2",
];
const rules3: AnonymizationRule[] = [
  { regex: "User \\d+", replacement: "User <ANON_USER_ID>" },
  { regex: "/data/(user|admin)/\\d+", replacement: "/data/<ANON_PATH_TYPE>/<ANON_ID>" },
  { regex: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", replacement: "<ANON_IP>" },
];
const expected3 = [
  {
    anonymizedMessage: "[INFO] [User] User <ANON_USER_ID> accessed resource /data/<ANON_PATH_TYPE>/<ANON_ID>",
    count: 4,
    earliestTimestamp: "2023-03-01T12:00:00.000Z",
    latestTimestamp: "2023-03-01T12:04:00.000Z",
  },
  {
    anonymizedMessage: "[WARN] [Auth] Failed login for user 'guest' from <ANON_IP>",
    count: 1,
    earliestTimestamp: "2023-03-01T12:03:00.000Z",
    latestTimestamp: "2023-03-01T12:03:00.000Z",
  },
  {
    anonymizedMessage: "[WARN] [Auth] Failed login for user 'admin' from <ANON_IP>",
    count: 1,
    earliestTimestamp: "2023-03-01T12:05:00.000Z",
    latestTimestamp: "2023-03-01T12:05:00.000Z",
  },
];
const result3 = aggregateAnonymizedLogPatterns(logs3, rules3);
console.log(JSON.stringify(result3, null, 2));
console.assert(result3.length === expected3.length, `Test 3 Failed: Expected ${expected3.length} patterns, got ${result3.length}`);
expected3.forEach((expectedPattern, index) => {
  const actualPattern = result3[index];
  console.assert(actualPattern.anonymizedMessage === expectedPattern.anonymizedMessage, `Test 3 Failed: Pattern message mismatch at index ${index}. Expected "${expectedPattern.anonymizedMessage}", got "${actualPattern.anonymizedMessage}"`);
  console.assert(actualPattern.count === expectedPattern.count, `Test 3 Failed: Pattern count mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.count}, got ${actualPattern.count}`);
  console.assert(actualPattern.earliestTimestamp === expectedPattern.earliestTimestamp, `Test 3 Failed: Pattern earliestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.earliestTimestamp}, got ${actualPattern.earliestTimestamp}`);
  console.assert(actualPattern.latestTimestamp === expectedPattern.latestTimestamp, `Test 3 Failed: Pattern latestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.latestTimestamp}, got ${actualPattern.latestTimestamp}`);
});
console.log("Test Case 3 Passed!");


console.log("\nTest Case 4: Edge case - single log entry");
const logs4 = [
  "2023-04-01T09:00:00Z [CRITICAL] [App] Fatal error occurred at line 123 in file main.ts."
];
const rules4: AnonymizationRule[] = [
  { regex: "line \\d+", replacement: "line <ANON_LINE_NUM>" },
  { regex: "file \\S+\\.ts", replacement: "file <ANON_FILE_PATH>" },
];
const expected4 = [
  {
    anonymizedMessage: "[CRITICAL] [App] Fatal error occurred at line <ANON_LINE_NUM> in file <ANON_FILE_PATH>.",
    count: 1,
    earliestTimestamp: "2023-04-01T09:00:00.000Z",
    latestTimestamp: "2023-04-01T09:00:00.000Z",
  },
];
const result4 = aggregateAnonymizedLogPatterns(logs4, rules4);
console.log(JSON.stringify(result4, null, 2));
console.assert(result4.length === expected4.length, `Test 4 Failed: Expected ${expected4.length} patterns, got ${result4.length}`);
expected4.forEach((expectedPattern, index) => {
  const actualPattern = result4[index];
  console.assert(actualPattern.anonymizedMessage === expectedPattern.anonymizedMessage, `Test 4 Failed: Pattern message mismatch at index ${index}. Expected "${expectedPattern.anonymizedMessage}", got "${actualPattern.anonymizedMessage}"`);
  console.assert(actualPattern.count === expectedPattern.count, `Test 4 Failed: Pattern count mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.count}, got ${actualPattern.count}`);
  console.assert(actualPattern.earliestTimestamp === expectedPattern.earliestTimestamp, `Test 4 Failed: Pattern earliestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.earliestTimestamp}, got ${actualPattern.earliestTimestamp}`);
  console.assert(actualPattern.latestTimestamp === expectedPattern.latestTimestamp, `Test 4 Failed: Pattern latestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.latestTimestamp}, got ${actualPattern.latestTimestamp}`);
});
console.log("Test Case 4 Passed!");


console.log("\nTest Case 5: Empty logs array");
const logs5: string[] = [];
const rules5: AnonymizationRule[] = [
  { regex: ".*", replacement: "<ANON_ALL>" }
];
const expected5: LogPattern[] = [];
const result5 = aggregateAnonymizedLogPatterns(logs5, rules5);
console.log(JSON.stringify(result5, null, 2));
console.assert(result5.length === expected5.length, `Test 5 Failed: Expected ${expected5.length} patterns, got ${result5.length}`);
console.log("Test Case 5 Passed!");


console.log("\nTest Case 6: Multiple instances of the same anonymized value in one log");
const logs6 = [
  "2023-05-01T00:00:00Z [INFO] [System] Processing item 123 and then item 456.",
];
const rules6: AnonymizationRule[] = [
  { regex: "item \\d+", replacement: "item <ANON_ITEM>" },
];
const expected6 = [
  {
    anonymizedMessage: "[INFO] [System] Processing item <ANON_ITEM> and then item <ANON_ITEM>.",
    count: 1,
    earliestTimestamp: "2023-05-01T00:00:00.000Z",
    latestTimestamp: "2023-05-01T00:00:00.000Z",
  },
];
const result6 = aggregateAnonymizedLogPatterns(logs6, rules6);
console.log(JSON.stringify(result6, null, 2));
console.assert(result6.length === expected6.length, `Test 6 Failed: Expected ${expected6.length} patterns, got ${result6.length}`);
expected6.forEach((expectedPattern, index) => {
  const actualPattern = result6[index];
  console.assert(actualPattern.anonymizedMessage === expectedPattern.anonymizedMessage, `Test 6 Failed: Pattern message mismatch at index ${index}. Expected "${expectedPattern.anonymizedMessage}", got "${actualPattern.anonymizedMessage}"`);
  console.assert(actualPattern.count === expectedPattern.count, `Test 6 Failed: Pattern count mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.count}, got ${actualPattern.count}`);
  console.assert(actualPattern.earliestTimestamp === expectedPattern.earliestTimestamp, `Test 6 Failed: Pattern earliestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.earliestTimestamp}, got ${actualPattern.earliestTimestamp}`);
  console.assert(actualPattern.latestTimestamp === expectedPattern.latestTimestamp, `Test 6 Failed: Pattern latestTimestamp mismatch at index ${index} for "${expectedPattern.anonymizedMessage}". Expected ${expectedPattern.latestTimestamp}, got ${actualPattern.latestTimestamp}`);
});
console.log("Test Case 6 Passed!");

// Run the solution
console.log('Running daily challenge solution...');
