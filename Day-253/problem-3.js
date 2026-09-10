// 🧩 PROBLEM–03: simulatePromiseChain()

// Logic: This function simulates Promise chain execution behavior.
// It processes steps in sequence, handling .then (resolve) and .catch (reject)
// handlers. The chain state tracks whether the promise is resolved or rejected.
// - "resolve" steps = .then handlers that resolve
// - "reject" steps = .then handlers that reject OR .catch handlers
// finally blocks always run after their associated step executes.

function simulatePromiseChain(steps) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(steps) || steps.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH STEP ---
    const validStatuses = ["resolve", "reject"];
    for (const step of steps) {
        if (
            typeof step !== 'object' ||
            step === null ||
            typeof step.name !== 'string' ||
            !validStatuses.includes(step.status) ||
            typeof step.hasFinally !== 'boolean'
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: SIMULATE PROMISE CHAIN ---
    const executionLog = [];
    // Chain state uses the same values as step status: "resolve" or "reject"
    // "pending" for initial state
    let chainState = "pending";
    let finalValue = undefined;

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const { name, status, value, hasFinally } = step;

        // Determine if this step should execute based on chain state
        let shouldExecute = false;

        if (chainState === "pending") {
            // First step always executes
            shouldExecute = true;
        } else if (chainState === "resolve") {
            // In resolved state, the next .then handler executes regardless of its outcome
            shouldExecute = true;
        } else if (chainState === "reject") {
            // In rejected state, skip .then (resolve) handlers, execute .catch (reject) handlers
            if (status === "reject") {
                shouldExecute = true;
            }
        }

        if (shouldExecute) {
            executionLog.push(name);

            // Update chain state based on step outcome
            if (chainState === "reject" && status === "reject") {
                // .catch handler executed - handles error, chain becomes resolved
                chainState = "resolve";
            } else {
                // Normal .then handler executes - chain state becomes step's status
                chainState = status;
            }
            finalValue = value;

            // Handle finally block - always runs after its step executes
            if (hasFinally) {
                executionLog.push(`finally:${name}`);
            }
        }
        // If step doesn't execute, its finally also doesn't run
    }

    // --- STEP 4: RETURN SIMULATION RESULT ---
    return {
        executionLog,
        finalStatus: chainState,
        finalValue
    };
}


// --- EXAMPLE USAGE ---
console.log(simulatePromiseChain([
    { name: "fetchUser", status: "resolve", value: "userData", hasFinally: false },
    { name: "parseData", status: "reject", value: "ParseError", hasFinally: true },
    { name: "saveDB", status: "resolve", value: "saved", hasFinally: false },
    { name: "handleError", status: "reject", value: "errorHandled", hasFinally: false }
]));


console.log(simulatePromiseChain("invalid"));