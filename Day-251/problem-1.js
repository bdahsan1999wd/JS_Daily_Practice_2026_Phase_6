// 🧩 PROBLEM–01: createCounter()

// Logic: This function creates a closure-based counter with private state.
// The counter maintains its internal value privately and exposes an API
// with increment, decrement, reset, and getCount methods. All state is
// encapsulated within the closure, preventing external access or modification.


function createCounter(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Check if config exists, is an object, and has all required properties
    // with valid numeric values.
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.start !== 'number' ||
        typeof config.step !== 'number' ||
        typeof config.min !== 'number' ||
        typeof config.max !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE LOGICAL CONSTRAINTS ---
    // Ensure min <= start <= max and step > 0
    if (config.min > config.start || config.start > config.max || config.step <= 0) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE STATE ---
    // Use a local variable to hold the current count.
    // This variable is only accessible within this function's scope
    // and the returned methods (closure).
    let currentCount = config.start;

    // --- STEP 4: DEFINE INCREMENT METHOD ---
    // Increases count by step, but clamps at max boundary.
    // Returns the new current value.
    const increment = () => {
        currentCount = Math.min(currentCount + config.step, config.max);
        return currentCount;
    };

    // --- STEP 5: DEFINE DECREMENT METHOD ---
    // Decreases count by step, but clamps at min boundary.
    // Returns the new current value.
    const decrement = () => {
        currentCount = Math.max(currentCount - config.step, config.min);
        return currentCount;
    };

    // --- STEP 6: DEFINE RESET METHOD ---
    // Resets count back to the original start value.
    // Returns the reset value.
    const reset = () => {
        currentCount = config.start;
        return currentCount;
    };

    // --- STEP 7: DEFINE GETCOUNT METHOD ---
    // Returns the current count value without modifying it.
    const getCount = () => currentCount;

    // --- STEP 8: RETURN COUNTER API ---
    // Return an object containing all methods. The internal state
    // (currentCount) remains private and inaccessible from outside.
    return {
        increment,
        decrement,
        reset,
        getCount
    };
}


// --- EXAMPLE USAGE ---
const counter = createCounter({ start: 0, step: 1, min: 0, max: 3 });
console.log(counter.increment());
console.log(counter.increment());
console.log(counter.decrement());
console.log(counter.reset());
console.log(counter.getCount());

console.log(createCounter("invalid"));