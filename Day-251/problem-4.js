// 🧩 PROBLEM–04: traceCallStack()

// Logic: This function simulates JavaScript's call stack behavior.
// It processes a sequence of function calls and returns, maintaining
// a stack data structure to track the current execution context.
// It also tracks maximum depth reached and detects stack underflow errors.

function traceCallStack(callSequence) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if callSequence is an array.
    if (!Array.isArray(callSequence)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH CALL OBJECT ---
    // Each call must be an object with valid fn (string) and action.
    const validActions = ["call", "return"];

    for (const call of callSequence) {
        if (
            typeof call !== 'object' ||
            call === null ||
            typeof call.fn !== 'string' ||
            !validActions.includes(call.action)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: INITIALIZE SIMULATION STATE ---
    // Stack to track active function calls
    const stack = [];
    // Track maximum depth reached during execution
    let maxDepth = 0;
    // Flag for stack underflow error
    let hasError = false;

    // --- STEP 4: PROCESS CALL SEQUENCE ---
    for (const call of callSequence) {
        const { fn, action } = call;

        if (action === "call") {
            // Push function onto stack
            stack.push(fn);

            // Update max depth if current stack is deeper
            if (stack.length > maxDepth) {
                maxDepth = stack.length;
            }
        } else if (action === "return") {
            // Check for underflow: trying to return from empty stack
            if (stack.length === 0) {
                hasError = true;
                continue;
            }

            // Verify the returning function matches the top of stack
            // (optional but good practice real JS would handle this)
            const topOfStack = stack[stack.length - 1];
            if (topOfStack !== fn) {
                // Mismatched return - still pop but flag error
                hasError = true;
            }

            // Pop from stack
            stack.pop();
        }
    }

    // --- STEP 5: RETURN SIMULATION RESULT ---
    // finalStack shows remaining functions (bottom to top)
    // maxDepth is the maximum concurrent calls
    // hasError indicates if underflow or mismatch occurred
    return {
        finalStack: [...stack],  // Create a copy to prevent external mutation
        maxDepth,
        hasError
    };
}

// --- EXAMPLE USAGE ---
console.log(traceCallStack([
    { fn: "main", action: "call" },
    { fn: "fetchData", action: "call" },
    { fn: "parseJSON", action: "call" },
    { fn: "parseJSON", action: "return" },
    { fn: "fetchData", action: "return" }
]));


// Test underflow error
console.log(traceCallStack([
    { fn: "main", action: "return" }
]));


// --- Invalid Input ---
console.log(traceCallStack("invalid"));