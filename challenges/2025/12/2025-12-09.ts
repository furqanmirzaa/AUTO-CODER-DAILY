/**
 * Daily Coding Challenge: 2025-12-09
 * Problem: Distributed Task Completion
 *
 * Description:
 * You are given a list of `task_durations` representing the time required to complete each task. You also have `num_workers` available. Tasks are processed in the order they appear in `task_durations`.

When a task needs to be processed, it is immediately assigned to the worker who will become free *earliest*. If multiple workers become free at the same earliest time, the one with the *lowest worker ID* (0-indexed) is chosen. Initially, all `num_workers` are free at time `0`.

Your goal is to calculate the final completion time of *all tasks*. This is the moment the last worker finishes their last assigned task.
 *
 * Examples:
 * [object Object],[object Object]
 * 
 * Constraints:
 * 1 <= len(task_durations) <= 10^5,1 <= task_durations[i] <= 1000,1 <= num_workers <= 10^5,num_workers <= len(task_durations) (to ensure all workers are potentially used or tasks are sufficient)
 *
 * Difficulty: Medium
 */

// ── Stage 1 ──
/*
 * The problem requires us to simulate task assignment to workers to find the final completion time of all tasks.
 * Tasks are processed in order, and each task is assigned to the worker who becomes free earliest.
 * If multiple workers become free at the same earliest time, the worker with the lowest ID is chosen.
 * All workers initially become free at time 0.
 *
 * This problem can be efficiently solved using a Min-Priority Queue (Min-Heap).
 * Each element in the heap will represent a worker and store their next available time and their ID.
 * The priority of an element in the heap will be determined first by the worker's available time (earliest first),
 * and then by their worker ID (lowest ID first) in case of a tie in available times.
 *
 * Algorithm:
 * 1. Initialize a Min-Heap. For each of the `num_workers` workers, add an entry `[0, worker_id]` to the heap.
 *    This signifies that all workers are initially free at time 0.
 * 2. Initialize `maxCompletionTime = 0`. This variable will track the completion time of the last task finished.
 * 3. Iterate through each `task_duration` in the `task_durations` list:
 *    a. Extract the worker `[workerFreeTime, workerId]` with the highest priority (earliest free time, lowest ID) from the heap.
 *    b. The current task will start at `workerFreeTime`.
 *    c. Calculate the `taskCompletionTime` for this task: `workerFreeTime + current_task_duration`.
 *    d. Update `maxCompletionTime = Math.max(maxCompletionTime, taskCompletionTime)`. This ensures we keep track of when the absolute last task finishes.
 *    e. Re-add the worker back to the heap with their new availability time: `[taskCompletionTime, workerId]`.
 * 4. After processing all tasks, `maxCompletionTime` will hold the final completion time of all tasks.
 *
 * Time Complexity:
 * - Initialization: `O(num_workers * log(num_workers))` to push all workers into the heap.
 * - Task processing: `len(task_durations)` iterations. In each iteration, we perform one `pop` and one `push` operation on the heap.
 *   Each heap operation takes `O(log(num_workers))` time.
 * - Total time complexity: `O(num_workers * log(num_workers) + len(task_durations) * log(num_workers))`. Since `num_workers <= len(task_durations)`,
 *   this simplifies to `O(len(task_durations) * log(num_workers))`.
 *   Given `len(task_durations)` up to `10^5` and `num_workers` up to `10^5`, `10^5 * log(10^5)` is approximately `10^5 * 17`, which is efficient enough.
 *
 * Space Complexity:
 * - `O(num_workers)` to store the worker states in the heap.
 */

// MinHeap class to manage worker availability
// Each element in the heap is a tuple: [available_time, worker_id]
class MinHeap {
    heap: [number, number][];

    constructor() {
        this.heap = [];
    }

    // Compares two worker tuples based on available time then worker ID.
    // Returns true if 'a' has higher priority (smaller available time, then smaller ID) than 'b'.
    _compare(a: [number, number], b: [number, number]): boolean {
        if (a[0] !== b[0]) {
            return a[0] < b[0]; // Lower available time has higher priority
        }
        return a[1] < b[1]; // If times are equal, lower worker ID has higher priority
    }

    // Swaps two elements in the heap array
    _swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Restores heap property by moving an element up the tree
    _siftUp(index: number) {
        let parentIndex = Math.floor((index - 1) / 2);
        // While current element has higher priority than its parent, swap them
        while (index > 0 && this._compare(this.heap[index], this.heap[parentIndex])) {
            this._swap(index, parentIndex);
            index = parentIndex;
            parentIndex = Math.floor((index - 1) / 2);
        }
    }

    // Restores heap property by moving an element down the tree
    _siftDown(index: number) {
        let leftChildIndex = 2 * index + 1;
        let rightChildIndex = 2 * index + 2;
        let smallestIndex = index;

        // Check if left child exists and has higher priority
        if (leftChildIndex < this.heap.length && this._compare(this.heap[leftChildIndex], this.heap[smallestIndex])) {
            smallestIndex = leftChildIndex;
        }

        // Check if right child exists and has higher priority than current smallest
        if (rightChildIndex < this.heap.length && this._compare(this.heap[rightChildIndex], this.heap[smallestIndex])) {
            smallestIndex = rightChildIndex;
        }

        // If a child had higher priority, swap and continue sifting down
        if (smallestIndex !== index) {
            this._swap(index, smallestIndex);
            this._siftDown(smallestIndex);
        }
    }

    // Adds an element to the heap
    push(value: [number, number]) {
        this.heap.push(value);
        this._siftUp(this.heap.length - 1);
    }

    // Removes and returns the highest priority element (root)
    pop(): [number, number] | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const root = this.heap[0];
        // Move the last element to the root and sift it down
        this.heap[0] = this.heap.pop()!;
        this._siftDown(0);
        return root;
    }

    // Returns the highest priority element without removing it
    peek(): [number, number] | undefined {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    // Returns the number of elements in the heap
    size(): number {
        return this.heap.length;
    }
}

function solve(task_durations: number[], num_workers: number): number {
    // Initialize the MinHeap for workers.
    const workerHeap = new MinHeap();

    // Add all workers to the heap. Initially, all are free at time 0.
    // The worker ID is important for tie-breaking when multiple workers are free at the same time.
    for (let i = 0; i < num_workers; i++) {
        workerHeap.push([0, i]);
    }

    // This variable will store the maximum completion time observed across all tasks.
    // This will be the final answer.
    let maxCompletionTime = 0;

    // Process each task in the order they appear in task_durations.
    for (const taskDuration of task_durations) {
        // Get the worker who will be available earliest. The 'pop' operation ensures this.
        // We use '!' to assert that pop() will not return undefined, as the heap is always populated
        // with at least 'num_workers' elements and we only pop and immediately push back.
        const [workerFreeTime, workerId] = workerHeap.pop()!;

        // The current task starts at the time this worker becomes free.
        const taskStartTime = workerFreeTime;

        // Calculate when this task will be completed.
        const taskCompletionTime = taskStartTime + taskDuration;

        // Update the overall maximum completion time. If this task finishes later than any previous task,
        // it becomes the new maximum.
        maxCompletionTime = Math.max(maxCompletionTime, taskCompletionTime);

        // The worker is now busy until taskCompletionTime. Add them back to the heap with their new availability.
        workerHeap.push([taskCompletionTime, workerId]);
    }

    // After all tasks have been processed, maxCompletionTime holds the time the last task finished.
    return maxCompletionTime;
}
