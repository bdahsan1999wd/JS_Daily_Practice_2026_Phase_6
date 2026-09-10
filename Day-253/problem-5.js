// 🧩 PROBLEM–05: simulateExecutionContext()

// Logic: This function simulates JavaScript's execution context stack.
// It processes a sequence of program instructions that create global
// context, call functions, return from functions, declare and assign
// variables. It tracks the context stack, global environment, and
// produces an execution log.


function simulateExecutionContext(program) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(program)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH INSTRUCTION ---
    const validTypes = ["createGlobal", "callFunction", "returnFunction", "declareVar", "assignVar"];
    for (const instr of program) {
        if (
            typeof instr !== 'object' ||
            instr === null ||
            !validTypes.includes(instr.type)
        ) {
            return "Invalid Input";
        }
        // Validate required fields for each type
        if (instr.type === "callFunction" || instr.type === "returnFunction") {
            if (typeof instr.fnName !== 'string') {
                return "Invalid Input";
            }
        }
        if (instr.type === "declareVar" || instr.type === "assignVar") {
            if (typeof instr.varName !== 'string') {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: INITIALIZE SIMULATION STATE ---
    // Stack of execution contexts (each context has name and local variables)
    const contextStack = [];
    // Global environment variables
    const globalEnv = {};
    // Execution log
    const executionLog = [];
    // Track if global context has been created
    let globalCreated = false;

    // --- STEP 4: PROCESS PROGRAM INSTRUCTIONS ---
    for (const instr of program) {
        const { type } = instr;

        switch (type) {
            case "createGlobal":
                if (!globalCreated) {
                    contextStack.push({ name: "GEC", variables: {} });
                    globalCreated = true;
                    executionLog.push("GEC created");
                }
                break;

            case "declareVar":
                if (!globalCreated) {
                    return "Invalid Input"; // Global must be created first
                }
                {
                    const { varName, value } = instr;
                    const currentContext = contextStack[contextStack.length - 1];
                    currentContext.variables[varName] = value;
                    // Also add to global if in GEC
                    if (currentContext.name === "GEC") {
                        globalEnv[varName] = value;
                    }
                    executionLog.push(`${currentContext.name}: var ${varName} = ${value}`);
                }
                break;

            case "assignVar":
                if (!globalCreated) {
                    return "Invalid Input";
                }
                {
                    const { varName, value } = instr;
                    const currentContext = contextStack[contextStack.length - 1];
                    // Find the variable in current context or parent contexts
                    let found = false;
                    for (let i = contextStack.length - 1; i >= 0; i--) {
                        if (contextStack[i].variables.hasOwnProperty(varName)) {
                            contextStack[i].variables[varName] = value;
                            if (contextStack[i].name === "GEC") {
                                globalEnv[varName] = value;
                            }
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        // Create in current context if not found
                        currentContext.variables[varName] = value;
                        if (currentContext.name === "GEC") {
                            globalEnv[varName] = value;
                        }
                    }
                    executionLog.push(`${currentContext.name}: ${varName} = ${value}`);
                }
                break;

            case "callFunction":
                if (!globalCreated) {
                    return "Invalid Input";
                }
                {
                    const { fnName } = instr;
                    contextStack.push({ name: fnName, variables: {} });
                    executionLog.push(`FEC pushed: ${fnName}`);
                }
                break;

            case "returnFunction":
                if (!globalCreated || contextStack.length <= 1) {
                    // Can't return from global or empty stack
                    executionLog.push("Error: Stack underflow");
                    break;
                }
                {
                    const { fnName } = instr;
                    const popped = contextStack.pop();
                    // Optionally verify fnName matches
                    if (popped.name !== fnName) {
                        executionLog.push(`Warning: Return mismatch ${popped.name} vs ${fnName}`);
                    }
                    executionLog.push(`FEC popped: ${fnName}`);
                }
                break;
        }
    }

    // --- STEP 5: RETURN SIMULATION RESULT ---
    return {
        contextStack: contextStack.map(ctx => ctx.name),
        globalEnv,
        executionLog
    };
}


// --- EXAMPLE USAGE ---
console.log(simulateExecutionContext([
    { type: "createGlobal" },
    { type: "declareVar", varName: "x", value: 10 },
    { type: "callFunction", fnName: "greet" },
    { type: "declareVar", varName: "msg", value: "hello" },
    { type: "returnFunction", fnName: "greet" },
    { type: "assignVar", varName: "x", value: 99 }
]));


// --- Invalid Input ---
console.log(simulateExecutionContext("invalid"));