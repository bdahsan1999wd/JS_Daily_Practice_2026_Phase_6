// 🧩 PROBLEM–02: createTaskQueueManager()

// Logic: This function creates a task queue manager that handles
// tasks with different priorities (high, normal, low) and queue types
// (FIFO or LIFO). Higher priority tasks are always dequeued before
// lower priority ones, regardless of queue type. Within the same
// priority, FIFO or LIFO order is respected.

function createTaskQueueManager(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.maxConcurrent !== 'number' ||
        (config.queueType !== "fifo" && config.queueType !== "lifo")
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE LOGICAL CONSTRAINTS ---
    if (config.maxConcurrent <= 0) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE QUEUES ---
    // Three priority queues, each is an array.
    const highQueue = [];
    const normalQueue = [];
    const lowQueue = [];

    // --- STEP 4: DEFINE ENQUEUE METHOD ---
    // Adds a task to the appropriate priority queue.
    // Validates priority is one of "high", "normal", "low".
    const enqueue = (taskName, priority) => {
        if (typeof taskName !== 'string' ||
            !["high", "normal", "low"].includes(priority)) {
            return "Invalid Input";
        }

        switch (priority) {
            case "high":
                highQueue.push(taskName);
                break;
            case "normal":
                normalQueue.push(taskName);
                break;
            case "low":
                lowQueue.push(taskName);
                break;
        }
    };

    // --- STEP 5: DEFINE DEQUEUE METHOD ---
    // Removes and returns the next task based on priority and queueType.
    // Priority order: high → normal → low
    // Within same priority: FIFO (shift) or LIFO (pop)
    const dequeue = () => {
        // Helper to dequeue from a specific queue
        const popFromQueue = (queue) => {
            if (config.queueType === "fifo") {
                return queue.shift();
            } else {
                return queue.pop();
            }
        };

        // Check high priority first
        if (highQueue.length > 0) {
            return { taskName: popFromQueue(highQueue), priority: "high" };
        }
        // Then normal
        if (normalQueue.length > 0) {
            return { taskName: popFromQueue(normalQueue), priority: "normal" };
        }
        // Then low
        if (lowQueue.length > 0) {
            return { taskName: popFromQueue(lowQueue), priority: "low" };
        }
        // Queue empty
        return "Queue Empty";
    };

    // --- STEP 6: DEFINE PEEK METHOD ---
    // Returns the next task without removing it.
    const peek = () => {
        if (highQueue.length > 0) {
            return { taskName: highQueue[0], priority: "high" };
        }
        if (normalQueue.length > 0) {
            return { taskName: normalQueue[0], priority: "normal" };
        }
        if (lowQueue.length > 0) {
            return { taskName: lowQueue[0], priority: "low" };
        }
        return "Queue Empty";
    };

    // --- STEP 7: DEFINE GETQUEUESTATE METHOD ---
    // Returns current state of the queue.
    const getQueueState = () => ({
        pending: highQueue.length + normalQueue.length + lowQueue.length,
        maxConcurrent: config.maxConcurrent,
        queueType: config.queueType
    });

    // --- STEP 8: RETURN QUEUE API ---
    return {
        enqueue,
        dequeue,
        peek,
        getQueueState
    };
}


// --- EXAMPLE USAGE ---
const queue = createTaskQueueManager({ maxConcurrent: 2, queueType: "fifo" });

queue.enqueue("taskA", "normal");
queue.enqueue("taskB", "high");
queue.enqueue("taskC", "low");
queue.enqueue("taskD", "high");

console.log(queue.dequeue());
console.log(queue.dequeue());
console.log(queue.dequeue());
console.log(queue.getQueueState());

// --- Invalid Input ---
console.log(createTaskQueueManager("invalid"));