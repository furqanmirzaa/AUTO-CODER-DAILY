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

// ── Stage 2 ──
/*
  The problem asks us to simulate task assignment to a pool of workers and find the final completion time of all tasks.
  Tasks are processed sequentially from `task_durations`.
  Each task is assigned to the worker who becomes free earliest. In case of a tie (multiple workers free at the same earliest time), the worker with the lowest ID (0-indexed) is chosen.
  Initially, all workers are free at time 0.

  To efficiently find the earliest free worker, a min-priority queue (min-heap) is the ideal data structure.
  Each element in the priority queue will represent a worker, storing their `[free_time, worker_id]`.
  The priority queue should order elements primarily by `free_time` (ascending) and secondarily by `worker_id` (ascending) for tie-breaking.

  Algorithm:
  1. Initialize a min-priority queue. Populate it with `num_workers` entries, each `[0, i]` for `i` from `0` to `num_workers - 1` (worker `i` is free at time `0`).
  2. Initialize `finalCompletionTime = 0`.
  3. Iterate through each `task_duration` in `task_durations`:
     a. Extract the worker `[worker_free_time, worker_id]` with the minimum `free_time` (and lowest `worker_id` for ties) from the priority queue.
     b. Calculate the new time this worker will become free after completing the current task: `new_worker_free_time = worker_free_time + task_duration`.
     c. Update `finalCompletionTime = Math.max(finalCompletionTime, new_worker_free_time)`. This ensures `finalCompletionTime` always tracks the completion time of the task that finishes latest so far.
     d. Insert the worker back into the priority queue with their updated free time: `[new_worker_free_time, worker_id]`.
  4. After processing all tasks, `finalCompletionTime` will hold the maximum of all individual task completion times, which is the overall final completion time.

  Time Complexity:
  - Initializing the priority queue: `O(num_workers * log(num_workers))`.
  - Processing each task: For each of `len(task_durations)` tasks, we perform `extractMin` and `insert` operations on the priority queue, each taking `O(log(num_workers))` time.
    Total for tasks: `O(len(task_durations) * log(num_workers))`.
  - Overall: `O(num_workers * log(num_workers) + len(task_durations) * log(num_workers))`.
  Given the constraints (up to 10^5 for both `num_workers` and `len(task_durations)`), this complexity is efficient enough.

  Space Complexity:
  - `O(num_workers)` for storing worker states in the priority queue.
*/

// A minimal Min-Priority Queue (Min-Heap) implementation.
// It stores elements and orders them based on a provided comparison function.
class PriorityQueue<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number; // Returns <0 if a<b, >0 if a>b, 0 if a==b

    /**
     * Creates a new PriorityQueue.
     * @param compareFn A comparison function that defines the order of elements.
     *                  It should return a negative value if `a` comes before `b`, 
     *                  a positive value if `a` comes after `b`, or `0` if they are equivalent.
     */
    constructor(compareFn: (a: T, b: T) => number) {
        this.compare = compareFn;
    }

    // Helper methods to get parent, left, and right child indices
    private parent(i: number): number { return Math.floor((i - 1) / 2); }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    // Swaps two elements in the heap array
    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Restores heap property by moving an element up the heap (used after insertion)
    private heapifyUp(index: number) {
        let currentIndex = index;
        // While current element is not root and is smaller than its parent
        while (currentIndex > 0 && this.compare(this.heap[currentIndex], this.heap[this.parent(currentIndex)]) < 0) {
            this.swap(currentIndex, this.parent(currentIndex));
            currentIndex = this.parent(currentIndex);
        }
    }

    // Restores heap property by moving an element down the heap (used after extraction)
    private heapifyDown(index: number) {
        let currentIndex = index;
        let leftChildIndex = this.left(currentIndex);
        let rightChildIndex = this.right(currentIndex);
        let smallestChildIndex = currentIndex; // Assume current is smallest initially

        // Check if left child exists and is smaller than current smallest
        if (leftChildIndex < this.heap.length && this.compare(this.heap[leftChildIndex], this.heap[smallestChildIndex]) < 0) {
            smallestChildIndex = leftChildIndex;
        }
        // Check if right child exists and is smaller than current smallest
        if (rightChildIndex < this.heap.length && this.compare(this.heap[rightChildIndex], this.heap[smallestChildIndex]) < 0) {
            smallestChildIndex = rightChildIndex;
        }

        // If the smallest is not the current element, swap and continue heapifying down
        if (smallestChildIndex !== currentIndex) {
            this.swap(currentIndex, smallestChildIndex);
            this.heapifyDown(smallestChildIndex);
        }
    }

    /**
     * Adds an element to the priority queue.
     * @param item The element to add.
     */
    insert(item: T) {
        this.heap.push(item);
        this.heapifyUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the smallest element from the priority queue.
     * @returns The smallest element, or `undefined` if the queue is empty.
     */
    extractMin(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop(); // Only one element, just remove it
        }

        const min = this.heap[0]; // The smallest element is at the root
        this.heap[0] = this.heap.pop()!; // Move the last element to the root
        this.heapifyDown(0); // Restore heap property from the root
        return min;
    }

    /**
     * Returns the smallest element without removing it.
     * @returns The smallest element, or `undefined` if the queue is empty.
     */
    peekMin(): T | undefined {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    /**
     * Checks if the priority queue is empty.
     * @returns `true` if the queue is empty, `false` otherwise.
     */
    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * Returns the number of elements in the priority queue.
     * @returns The size of the queue.
     */
    size(): number {
        return this.heap.length;
    }
}

function solve(task_durations: number[], num_workers: number): number {
    // Define the comparison function for worker objects in the priority queue.
    // Each worker object is a tuple: [worker_free_time, worker_id].
    // We want to prioritize workers who become free earliest (lower worker_free_time).
    // If free times are equal, prioritize workers with lower IDs.
    const workerComparator = (a: [number, number], b: [number, number]): number => {
        if (a[0] !== b[0]) {
            return a[0] - b[0]; // Sort by free_time in ascending order
        }
        return a[1] - b[1]; // If free_time is equal, sort by worker_id in ascending order
    };

    // Initialize the priority queue with all workers.
    // Initially, all workers are free at time 0.
    const workerQueue = new PriorityQueue<[number, number]>(workerComparator);
    for (let i = 0; i < num_workers; i++) {
        workerQueue.insert([0, i]); // Worker 'i' is free at time 0
    }

    let finalCompletionTime = 0; // Tracks the completion time of the last task finished overall

    // Process each task in the given order.
    for (const duration of task_durations) {
        // 1. Get the worker who will be free earliest (and has the lowest ID in case of ties).
        // The '!' is used to assert that extractMin will not return undefined here because
        // problem constraints guarantee `num_workers >= 1` and tasks are being processed.
        const [worker_free_time, worker_id] = workerQueue.extractMin()!;

        // 2. Calculate when this worker will finish the current task.
        // This worker starts the task at `worker_free_time` and finishes after `duration`.
        const new_worker_free_time = worker_free_time + duration;

        // 3. Update the overall final completion time.
        // This variable keeps track of the maximum completion time among all tasks processed so far.
        finalCompletionTime = Math.max(finalCompletionTime, new_worker_free_time);

        // 4. Put the worker back into the priority queue with their updated (later) free time.
        workerQueue.insert([new_worker_free_time, worker_id]);
    }

    // After all tasks are assigned and processed, `finalCompletionTime` will hold
    // the completion time of the task that finished last, which is the overall solution.
    return finalCompletionTime;
}

// ── Stage 3 ──
// Define the structure for a worker in the priority queue
interface WorkerStatus {
    free_time: number; // The time when this worker will become free
    worker_id: number; // The unique identifier for the worker (0-indexed)
}

// Min-Priority Queue implementation
// This class manages a collection of WorkerStatus objects, always allowing
// efficient retrieval of the worker who will be free earliest, breaking ties
// by worker ID.
class MinPriorityQueue {
    private heap: WorkerStatus[] = []; // The underlying array that stores the heap elements

    // Comparison function for heap elements.
    // It returns a negative number if 'a' has higher priority than 'b',
    // a positive number if 'b' has higher priority, and 0 if they are equal.
    // Priority rules: lower free_time first, then lower worker_id.
    private compare(a: WorkerStatus, b: WorkerStatus): number {
        if (a.free_time !== b.free_time) {
            return a.free_time - b.free_time;
        }
        // If free times are equal, prioritize the worker with the lower ID.
        return a.worker_id - b.worker_id;
    }

    // Helper function to swap two elements in the heap array.
    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Restores the heap property by moving an element upwards after insertion.
    private bubbleUp(index: number) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2); // Calculate parent index
            // If the current element has higher priority than its parent, swap them.
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex; // Continue bubbling up from the new position
            } else {
                // If the heap property is satisfied, stop.
                break;
            }
        }
    }

    // Restores the heap property by moving an element downwards after extraction.
    private bubbleDown(index: number) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index; // Assume current node is the smallest (highest priority)

            // Check if left child exists and has higher priority
            if (leftChildIndex <= lastIndex && this.compare(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = leftChildIndex;
            }
            // Check if right child exists and has higher priority than current smallest
            if (rightChildIndex <= lastIndex && this.compare(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = rightChildIndex;
            }

            // If the smallest element is not the current element, swap them.
            if (smallestIndex !== index) {
                this.swap(index, smallestIndex);
                index = smallestIndex; // Continue bubbling down from the new position
            } else {
                // If the current element is the smallest, stop.
                break;
            }
        }
    }

    // Adds a new element to the priority queue.
    push(item: WorkerStatus) {
        this.heap.push(item); // Add to the end
        this.bubbleUp(this.heap.length - 1); // Restore heap property
    }

    // Removes and returns the element with the highest priority (smallest free_time, then worker_id).
    pop(): WorkerStatus | undefined {
        if (this.heap.length === 0) {
            return undefined; // Queue is empty
        }
        if (this.heap.length === 1) {
            return this.heap.pop(); // Only one element, just remove it
        }

        const root = this.heap[0]; // The element to be returned
        this.heap[0] = this.heap.pop()!; // Move the last element to the root
        this.bubbleDown(0); // Restore heap property from the root
        return root;
    }

    // Returns the element with the highest priority without removing it.
    peek(): WorkerStatus | undefined {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    // Returns the current number of elements in the queue.
    size(): number {
        return this.heap.length;
    }
}

/**
 * Calculates the final completion time of all tasks given their durations and number of workers.
 * Tasks are assigned to the earliest free worker, with tie-breaking by lowest worker ID.
 *
 * @param task_durations A list of numbers representing the time required for each task.
 * @param num_workers The total number of available workers.
 * @returns The final time when the last task is completed.
 */
function solve(task_durations: number[], num_workers: number): number {
    // Initialize a min-priority queue to keep track of worker availability.
    // The queue will store WorkerStatus objects ({ free_time, worker_id }).
    // It automatically orders workers by their free_time (earliest first),
    // and then by worker_id (lowest first) for tie-breaking.
    const workerQueue = new MinPriorityQueue();

    // Initially, all `num_workers` are free at time `0`.
    // Add each worker to the priority queue.
    for (let i = 0; i < num_workers; i++) {
        workerQueue.push({ free_time: 0, worker_id: i });
    }

    // This variable will store the maximum completion time encountered among all tasks.
    // It represents the moment the very last task finishes.
    let finalCompletionTime = 0;

    // Process each task in the order they appear in `task_durations`.
    for (const duration of task_durations) {
        // 1. Get the worker who will become free *earliest*.
        // This is done by popping the top element from the min-priority queue.
        const earliestWorker = workerQueue.pop();

        // Safety check: In a valid problem scenario, there should always be a worker
        // as tasks are processed sequentially and workers are re-added. This error
        // indicates an unexpected state, e.g., queue became empty mid-processing.
        // Given the problem constraints (`num_workers <= len(task_durations)`), this
        // branch should not be reachable unless the input is invalid (e.g., empty num_workers).
        if (!earliestWorker) {
            throw new Error("Logic error: No workers available for tasks.");
        }

        // 2. Determine the start time for the current task.
        // The task starts immediately when the assigned worker becomes free.
        const taskStartTime = earliestWorker.free_time;

        // 3. Calculate the completion time for the current task.
        const taskCompletionTime = taskStartTime + duration;

        // 4. Update the worker's status and re-add them to the queue.
        // This worker is now busy until `taskCompletionTime`.
        workerQueue.push({
            free_time: taskCompletionTime,
            worker_id: earliestWorker.worker_id,
        });

        // 5. Update the overall `finalCompletionTime`.
        // The final completion time of *all tasks* is the completion time of the last task
        // to finish. We track this by taking the maximum of all individual task completion times.
        finalCompletionTime = Math.max(finalCompletionTime, taskCompletionTime);
    }

    // After all tasks have been processed, `finalCompletionTime` holds the moment
    // the last worker finishes their last assigned task.
    return finalCompletionTime;
}
