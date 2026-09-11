// 🧩 PROBLEM–04: buildLexicalEnvironment()

// Logic: This function builds the lexical environment chain for each
// function based on where it was defined (not where it's called).
// Each function captures its outer lexical environment at definition time.


function buildLexicalEnvironment(functions) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(functions)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH FUNCTION ---
    for (const fn of functions) {
        if (
            typeof fn !== 'object' ||
            fn === null ||
            typeof fn.name !== 'string' ||
            (fn.definedIn !== null && typeof fn.definedIn !== 'string') ||
            typeof fn.variables !== 'object' ||
            fn.variables === null
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD FUNCTION MAP ---
    const fnMap = new Map();
    for (const fn of functions) {
        fnMap.set(fn.name, fn);
    }

    // --- STEP 4: VALIDATE DEFINEDIN REFERENCES ---
    for (const fn of functions) {
        if (fn.definedIn !== null && !fnMap.has(fn.definedIn)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: BUILD LEXICAL CHAIN FOR EACH FUNCTION ---
    const results = [];

    for (const fn of functions) {
        const lexicalChain = [];
        const resolvedEnv = {};

        // Walk up the lexical chain (where function was defined)
        let currentScopeName = fn.name;
        while (currentScopeName !== null) {
            lexicalChain.push(currentScopeName);
            const currentFn = fnMap.get(currentScopeName);
            if (currentFn) {
                // Merge variables: current scope overrides outer scopes
                for (const [key, value] of Object.entries(currentFn.variables)) {
                    if (!(key in resolvedEnv)) {
                        resolvedEnv[key] = value;
                    }
                }
            }
            currentScopeName = currentFn ? currentFn.definedIn : null;
        }

        results.push({
            functionName: fn.name,
            lexicalChain,
            resolvedEnv
        });
    }

    // --- STEP 6: RETURN RESULTS ---
    return results;
}


// --- EXAMPLE USAGE ---
console.log(buildLexicalEnvironment([
    { name: "global", definedIn: null, variables: { x: 1, y: 2 } },
    { name: "outer", definedIn: "global", variables: { y: 99, z: 3 } },
    { name: "inner", definedIn: "outer", variables: { z: 42 } }
]));


// --- Invalid Input ---
console.log(buildLexicalEnvironment("invalid"));