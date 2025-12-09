/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Daily Rolling Discount Eligibility
 * 
 * Description:
 * You are tasked with building a system to track customer discount eligibility based on their recent purchasing activity. A customer becomes eligible for a discount on a given day if their total purchase amount over the most recent 'k' consecutive days (including the current day) meets or exceeds a specified 'threshold'.

For the first `k-1` days, the window of considered purchases includes all days from Day 0 up to the current day. From Day `k-1` onwards, the window covers exactly the most recent `k` days. If the total length of `daily_purchases` is less than `k`, the window will always include all purchases from Day 0 up to the current day.

Your function should take a list of daily purchase amounts, the window size `k`, and the `threshold` amount, and return a boolean list indicating eligibility for each day.
 * 
 * Examples:
 * [object Object],[object Object],[object Object]
 * 
 * Constraints:
 * 1 <= len(daily_purchases) <= 10^5,0 <= daily_purchases[i] <= 1000,1 <= k <= 10^5,1 <= threshold <= 10^9
 * 
 * Difficulty: Medium
 */

function calculateDiscountEligibility(daily_purchases: number[], k: number, threshold: number): boolean[] {
    const n = daily_purchases.length;
    const eligibility: boolean[] = new Array(n); // Initialize eligibility array to store results

    // If there are no purchases, no one is eligible.
    if (n === 0) {
        return [];
    }

    let currentWindowSum: number = 0; // Stores the sum of purchases in the current window

    // Iterate through each day to calculate eligibility
    for (let i = 0; i < n; i++) {
        // Step 1: Add the current day's purchase to the window sum.
        currentWindowSum += daily_purchases[i];

        // Step 2: If the window has become larger than 'k' days,
        // remove the purchase that has fallen out of the window.
        // The element to remove is at index `i - k`.
        // This condition implicitly handles the initial days:
        // For `i < k`, `i - k` would be negative, so the condition `i >= k` is false,
        // and no element is removed. This correctly allows the window to grow
        // from Day 0 up to Day `i` for the first `k-1` days.
        // Once `i` reaches `k`, the element at index `0` (`i - k`) is removed,
        // and the window maintains a size of `k`.
        if (i >= k) {
            currentWindowSum -= daily_purchases[i - k];
        }

        // Step 3: Check if the current window sum meets or exceeds the threshold.
        eligibility[i] = currentWindowSum >= threshold;
    }

    return eligibility;
}

/*
Explanation of the Approach:

The problem requires calculating a rolling sum over a window of `k` days (or fewer for the initial days) and checking if this sum meets a `threshold`. A naive approach of re-summing the window for each day would lead to an O(N*K) time complexity, which is too slow for large inputs (where N and K can be up to 10^5).

A more efficient approach is to use a "sliding window" technique:

1.  **Initialize**:
    *   Create an `eligibility` boolean array of the same length as `daily_purchases` to store the results.
    *   Initialize `currentWindowSum` to 0. This variable will keep track of the sum of purchases within the current window.

2.  **Iterate Through Days**: Loop from `i = 0` to `n - 1` (where `n` is the number of days). For each day `i`:
    a.  **Add Current Day's Purchase**: Add `daily_purchases[i]` to `currentWindowSum`. This extends the window to include the current day.
    b.  **Remove Oldest Purchase (if window is full)**: If `i` is `k` or greater, it means the window has grown to `k+1` elements. To maintain a window of exactly `k` elements (for `i >= k-1`), we need to remove the purchase from `k` days ago. The purchase at index `i - k` is the one that is now outside the `k`-day window ending on day `i`. So, `daily_purchases[i - k]` is subtracted from `currentWindowSum`.
        *   **Special case for initial days**: For days `i < k`, the condition `i >= k` will be false, so no element will be removed. The `currentWindowSum` will naturally represent the sum of all purchases from Day 0 up to Day `i`, which correctly matches the problem's requirement for the first `k-1` days. If the total length of `daily_purchases` is less than `k`, this behavior persists for all days.
    c.  **Check Eligibility**: Compare `currentWindowSum` with the `threshold`. If `currentWindowSum >= threshold`, set `eligibility[i]` to `true`; otherwise, set it to `false`.

3.  **Return**: After iterating through all days, return the `eligibility` array.

This sliding window approach ensures that we only perform constant time operations (addition, subtraction, comparison) for each day, leading to optimal performance.

Time and Space Complexity Analysis:

*   **Time Complexity**: O(N)
    *   The algorithm iterates through the `daily_purchases` array exactly once (a loop from `i = 0` to `n - 1`).
    *   Inside the loop, all operations (addition, subtraction, array access, comparison, assignment) are constant time, O(1).
    *   Therefore, the total time complexity is directly proportional to the number of daily purchases, N.

*   **Space Complexity**: O(N)
    *   An additional array, `eligibility`, is created to store the boolean results. This array has a size equal to the number of daily purchases, N.
    *   All other variables (`n`, `currentWindowSum`, `i`) consume only a constant amount of space.
    *   Therefore, the total space complexity is proportional to the number of daily purchases, N.
*/

// --- Test Cases ---

// Helper function for assertions (for internal testing purposes)
function assertArrayEquals(actual: boolean[], expected: boolean[], testName: string) {
    if (actual.length !== expected.length) {
        console.error(`FAIL: ${testName} - Length mismatch. Expected ${expected.length}, got ${actual.length}.`);
        return;
    }
    for (let i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) {
            console.error(`FAIL: ${testName} - Mismatch at index ${i}. Expected ${expected[i]}, got ${actual[i]}.`);
            return;
        }
    }
    console.log(`PASS: ${testName}`);
}

// Test cases
function runAllTests() {
    console.log("Running Daily Rolling Discount Eligibility Tests...");

    // Example 1: Basic case with full window
    let daily_purchases1 = [10, 5, 20, 15, 30];
    let k1 = 3;
    let threshold1 = 40;
    let expected1 = [false, false, false, true, true];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases1, k1, threshold1), expected1, "Example 1");

    // Example 2: Window size k is larger than daily_purchases length
    let daily_purchases2 = [10, 5, 20];
    let k2 = 5;
    let threshold2 = 30;
    let expected2 = [false, false, true];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases2, k2, threshold2), expected2, "Example 2 (k > N)");

    // Example 3: Edge case - all purchases are 0, threshold > 0
    let daily_purchases3 = [0, 0, 0, 0, 0];
    let k3 = 2;
    let threshold3 = 1;
    let expected3 = [false, false, false, false, false];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases3, k3, threshold3), expected3, "Example 3 (zeros, high threshold)");

    // Example 4: Edge case - all purchases are high, threshold low, k=1
    let daily_purchases4 = [100, 100, 100];
    let k4 = 1;
    let threshold4 = 50;
    let expected4 = [true, true, true];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases4, k4, threshold4), expected4, "Example 4 (high purchases, low threshold, k=1)");

    // Example 5: Empty daily_purchases array
    let daily_purchases5: number[] = [];
    let k5 = 3;
    let threshold5 = 100;
    let expected5: boolean[] = [];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases5, k5, threshold5), expected5, "Example 5 (empty purchases)");

    // Example 6: Single purchase, k=1, eligible
    let daily_purchases6 = [50];
    let k6 = 1;
    let threshold6 = 50;
    let expected6 = [true];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases6, k6, threshold6), expected6, "Example 6 (single purchase, k=1, eligible)");

    // Example 7: Single purchase, k=1, not eligible
    let daily_purchases7 = [49];
    let k7 = 1;
    let threshold7 = 50;
    let expected7 = [false];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases7, k7, threshold7), expected7, "Example 7 (single purchase, k=1, not eligible)");

    // Example 8: Single purchase, k > 1
    let daily_purchases8 = [50];
    let k8 = 2;
    let threshold8 = 50;
    let expected8 = [true];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases8, k8, threshold8), expected8, "Example 8 (single purchase, k > 1, eligible)");

    // Example 9: Long list with fluctuating sums (corrected expected output)
    let daily_purchases9 = [10, 20, 5, 30, 10, 25, 5, 15, 40, 5];
    let k9 = 4;
    let threshold9 = 60;
    // Expected trace:
    // D0 (10): [10] sum=10 <60 -> F
    // D1 (20): [10,20] sum=30 <60 -> F
    // D2 (5): [10,20,5] sum=35 <60 -> F
    // D3 (30): [10,20,5,30] sum=65 >=60 -> T (window size k=4 reached)
    // D4 (10): [20,5,30,10] sum=55 <60 -> F (10 removed)
    // D5 (25): [5,30,10,25] sum=60 >=60 -> T (20 removed)
    // D6 (5): [30,10,25,5] sum=60 >=60 -> T (5 removed)
    // D7 (15): [10,25,5,15] sum=55 <60 -> F (30 removed)
    // D8 (40): [25,5,15,40] sum=85 >=60 -> T (10 removed)
    // D9 (5): [5,15,40,5] sum=65 >=60 -> T (25 removed)
    let expected9 = [false, false, false, true, false, true, true, false, true, true];
    assertArrayEquals(calculateDiscountEligibility(daily_purchases9, k9, threshold9), expected9, "Example 9 (long list, corrected expected)");


    console.log("\nAll tests completed.");
}

// Uncomment the line below to run the tests (e.g., in a Node.js environment)
// runAllTests();

// Run the solution
console.log('Running daily challenge solution...');
