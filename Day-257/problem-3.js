// 🧩 PROBLEM–03: createScopeMemoryEngine()

// Logic: This function creates a scope and memory management engine
// that tracks nested scopes, variable lookups, and garbage collection.
// It maintains a scope stack and tracks GC-eligible variables when
// scopes are popped. Auto-GC runs every gcInterval operations.


function createScopeMemoryEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.gcInterval !== 'number' ||
        typeof config.maxScopeDepth !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.gcInterval <= 0 || config.maxScopeDepth <= 0) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    const scopeStack = []; // Array of { name, variables: Map }
    const gcEligible = []; // Variables eligible for GC
    let totalCollected = 0;
    let operationCount = 0;

    // --- STEP 3: DEFINE PUSHSCOPE ---
    function pushScope(scopeName, variables) {
        operationCount++;

        if (scopeStack.length >= config.maxScopeDepth) {
            return "Max Depth Exceeded";
        }

        const varMap = new Map();
        if (variables && typeof variables === 'object') {
            for (const [key, value] of Object.entries(variables)) {
                varMap.set(key, value);
            }
        }

        scopeStack.push({ name: scopeName, variables: varMap });

        // Auto-GC check
        if (operationCount % config.gcInterval === 0) {
            runGC();
        }

        return true;
    }

    // --- STEP 4: DEFINE POPSCOPE ---
    function popScope() {
        operationCount++;

        if (scopeStack.length === 0) {
            return "No Active Scope";
        }

        const popped = scopeStack.pop();
        // Mark popped scope's variables as GC eligible
        for (const [key] of popped.variables) {
            gcEligible.push(key);
        }

        // Auto-GC check
        if (operationCount % config.gcInterval === 0) {
            runGC();
        }

        return true;
    }

    // --- STEP 5: DEFINE LOOKUP ---
    function lookup(varName) {
        operationCount++;

        if (scopeStack.length === 0) {
            return "No Active Scope";
        }

        // Search from innermost to outermost
        for (let i = scopeStack.length - 1; i >= 0; i--) {
            const scope = scopeStack[i];
            if (scope.variables.has(varName)) {
                // Auto-GC check
                if (operationCount % config.gcInterval === 0) {
                    runGC();
                }
                return scope.variables.get(varName);
            }
        }

        // Auto-GC check
        if (operationCount % config.gcInterval === 0) {
            runGC();
        }

        return "undefined";
    }

    // --- STEP 6: DEFINE RUNGC ---
    function runGC() {
        // In this simplified model, we just count eligible variables as collected
        // and clear the gcEligible list
        totalCollected += gcEligible.length;
        gcEligible.length = 0;
    }

    // --- STEP 7: DEFINE GETSTATE ---
    function getState() {
        return {
            scopeStack: scopeStack.map(s => s.name),
            gcEligible: [...gcEligible],
            totalCollected,
            operationCount
        };
    }

    // --- STEP 8: RETURN API ---
    return {
        pushScope,
        popScope,
        lookup,
        runGC,
        getState
    };
}


// --- EXAMPLE USAGE ---
const engine = createScopeMemoryEngine({ gcInterval: 3, maxScopeDepth: 2 });

engine.pushScope("global", { x: 10, y: 20 });
engine.pushScope("inner", { z: 30 });
console.log(engine.lookup("x"));
engine.popScope();
console.log(engine.getState());
engine.runGC();
console.log(engine.getState().totalCollected);


// --- Invalid Input ---
console.log(createScopeMemoryEngine("invalid"));