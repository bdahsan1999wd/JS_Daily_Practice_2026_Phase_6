// 🧩 PROBLEM–02: resolveScopeChain()

// Logic: This function simulates JavaScript's lexical scope resolution.
// It builds a scope chain from the provided scope tree and resolves
// variable lookups by walking up the parentScope chain from the
// innermost scope until the variable is found or the chain ends.


function resolveScopeChain(scopeTree, startScope, variablesToLookup) {

    // --- STEP 1: VALIDATE INPUTS ---
    // Check that scopeTree is an array, startScope is a string,
    // and variablesToLookup is an array.
    if (
        !Array.isArray(scopeTree) ||
        typeof startScope !== 'string' ||
        !Array.isArray(variablesToLookup)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE SCOPE TREE STRUCTURE ---
    // Each scope must be an object with required properties.
    for (const scope of scopeTree) {
        if (
            typeof scope !== 'object' ||
            scope === null ||
            typeof scope.scopeName !== 'string' ||
            typeof scope.variables !== 'object' ||
            scope.variables === null ||
            (scope.parentScope !== null && typeof scope.parentScope !== 'string')
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD SCOPE MAP ---
    // Create a Map for O(1) lookup of scopes by name.
    const scopeMap = new Map();
    for (const scope of scopeTree) {
        scopeMap.set(scope.scopeName, scope);
    }

    // --- STEP 4: VALIDATE START SCOPE EXISTS ---
    // Ensure the starting scope is in the scope tree.
    if (!scopeMap.has(startScope)) {
        return "Invalid Input";
    }

    // --- STEP 5: RESOLVE EACH VARIABLE ---
    // For each variable to look up, walk the scope chain.
    const result = {};

    for (const variable of variablesToLookup) {
        let currentScopeName = startScope;
        let resolvedValue = "undefined";

        // Walk up the scope chain
        while (currentScopeName !== null) {
            const currentScope = scopeMap.get(currentScopeName);

            // Check if variable exists in current scope
            if (currentScope.variables.hasOwnProperty(variable)) {
                resolvedValue = currentScope.variables[variable];
                break;
            }

            // Move to parent scope
            currentScopeName = currentScope.parentScope;
        }

        result[variable] = resolvedValue;
    }

    // --- STEP 6: RETURN RESOLUTION RESULT ---
    return result;
}


// --- EXAMPLE USAGE ---
console.log(resolveScopeChain(
    [
        { scopeName: "global", variables: { x: 10, y: 20 }, parentScope: null },
        { scopeName: "outer", variables: { y: 99, z: 5 }, parentScope: "global" },
        { scopeName: "inner", variables: { z: 42 }, parentScope: "outer" }
    ],
    "inner",
    ["x", "y", "z", "w"]
));


console.log(resolveScopeChain("invalid", "global", ["x"]));