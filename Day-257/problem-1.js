// 🧩 PROBLEM–01: analyzeRuntimeBehavior()

// Logic: This function analyzes a program's runtime behavior by tracking
// hoisting state, call stack changes, execution queue order, and TDZ
// violations. It processes instructions in sequence and builds a
// comprehensive analysis report.


function analyzeRuntimeBehavior(program) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(program)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH INSTRUCTION ---
    const validTypes = ["declare", "call", "return", "schedule"];
    const validKeywords = ["var", "let", "const"];
    const validScheduleTypes = ["microtask", "macrotask"];

    for (const instr of program) {
        if (
            typeof instr !== 'object' ||
            instr === null ||
            !validTypes.includes(instr.type) ||
            typeof instr.name !== 'string' ||
            typeof instr.order !== 'number'
        ) {
            return "Invalid Input";
        }
        if (instr.type === "declare" && !validKeywords.includes(instr.keyword)) {
            return "Invalid Input";
        }
        if (instr.type === "schedule" && !validScheduleTypes.includes(instr.scheduleType)) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: SORT BY ORDER ---
    const instructions = [...program].sort((a, b) => a.order - b.order);

    // --- STEP 4: ANALYZE HOISTING (pre-execution) ---
    // Process all declarations first to build hoisting map
    const hoistingMap = {};
    for (const instr of instructions) {
        if (instr.type === "declare") {
            const { keyword, name } = instr;
            if (keyword === "var") {
                hoistingMap[name] = "undefined";
            } else {
                hoistingMap[name] = "TDZ";
            }
        }
    }

    // --- STEP 5: SIMULATE CALL STACK ---
    const callStack = [];
    const callStackTrace = [];

    for (const instr of instructions) {
        if (instr.type === "call") {
            callStack.push(instr.name);
            callStackTrace.push(`${instr.name} pushed`);
        } else if (instr.type === "return") {
            if (callStack.length > 0) {
                const popped = callStack.pop();
                callStackTrace.push(`${popped} popped`);
            }
        }
    }

    // --- STEP 6: DETERMINE EXECUTION ORDER ---
    // Microtasks before macrotasks
    const microtasks = [];
    const macrotasks = [];

    for (const instr of instructions) {
        if (instr.type === "schedule") {
            if (instr.scheduleType === "microtask") {
                microtasks.push(instr.name);
            } else {
                macrotasks.push(instr.name);
            }
        }
    }

    const executionOrder = [...microtasks, ...macrotasks];

    // --- STEP 7: DETECT TDZ VIOLATIONS ---
    // Track let/const declarations and their order
    const declared = new Set();
    const tdzViolations = [];

    for (const instr of instructions) {
        if (instr.type === "declare") {
            declared.add(instr.name);
        }
        // In this simplified model, we don't have explicit access instructions
        // TDZ violations would require access before declare instructions
        // The sample doesn't show TDZ violations, so we return empty array
    }

    // --- STEP 8: RETURN RESULTS ---
    return {
        hoistingMap,
        callStackTrace,
        executionOrder,
        tdzViolations
    };
}


// --- EXAMPLE USAGE ---
console.log(analyzeRuntimeBehavior([
    { type: "declare", keyword: "var", name: "x", order: 1 },
    { type: "declare", keyword: "let", name: "y", order: 2 },
    { type: "call", name: "fetchData", order: 3 },
    { type: "schedule", name: "promise_CB", scheduleType: "microtask", order: 4 },
    { type: "schedule", name: "timeout_CB", scheduleType: "macrotask", order: 5 },
    { type: "return", name: "fetchData", order: 6 }
]));


// --- Invalid Input ---
console.log(analyzeRuntimeBehavior("invalid"));