// 🧩 PROBLEM–02: detectVariableShadowing()

// Logic: This function detects variable shadowing across a scope hierarchy.
// It builds a scope tree from the input and identifies all cases where
// an inner scope declares a variable with the same name as a variable
// in an outer scope (parent, grandparent, etc.).


function detectVariableShadowing(scopes) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(scopes)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH SCOPE ---
    for (const scope of scopes) {
        if (
            typeof scope !== 'object' ||
            scope === null ||
            typeof scope.scopeName !== 'string' ||
            (scope.parentScope !== null && typeof scope.parentScope !== 'string') ||
            !Array.isArray(scope.variables)
        ) {
            return "Invalid Input";
        }
        for (const v of scope.variables) {
            if (typeof v !== 'string') {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: BUILD SCOPE MAP ---
    const scopeMap = new Map();
    for (const scope of scopes) {
        scopeMap.set(scope.scopeName, scope);
    }

    // --- STEP 4: VALIDATE PARENT SCOPES EXIST ---
    for (const scope of scopes) {
        if (scope.parentScope !== null && !scopeMap.has(scope.parentScope)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: FIND SHADOWING PAIRS ---
    const shadowingPairs = [];

    // For each scope, check its variables against all ancestor scopes
    for (const scope of scopes) {
        const currentScopeName = scope.scopeName;
        const currentVariables = new Set(scope.variables);

        // Walk up the parent chain
        let parentName = scope.parentScope;
        while (parentName !== null) {
            const parentScope = scopeMap.get(parentName);
            if (!parentScope) break;

            const parentVariables = new Set(parentScope.variables);

            // Find intersection - variables declared in both current and parent
            for (const varName of currentVariables) {
                if (parentVariables.has(varName)) {
                    shadowingPairs.push({
                        variable: varName,
                        innerScope: currentScopeName,
                        outerScope: parentName
                    });
                }
            }

            parentName = parentScope.parentScope;
        }
    }

    // --- STEP 6: FIND CLEAN SCOPES ---
    // A scope is "clean" if it does not declare any variable that shadows an outer scope
    // (i.e., none of its variables appear as innerScope in shadowingPairs)
    const shadowingInnerScopes = new Set();
    for (const pair of shadowingPairs) {
        shadowingInnerScopes.add(pair.innerScope);
    }

    const cleanScopes = [];
    for (const scope of scopes) {
        if (!shadowingInnerScopes.has(scope.scopeName)) {
            cleanScopes.push(scope.scopeName);
        }
    }

    // --- STEP 7: RETURN RESULTS ---
    return {
        shadowingPairs,
        totalShadows: shadowingPairs.length,
        cleanScopes
    };
}


// --- EXAMPLE USAGE ---
console.log(detectVariableShadowing([
    { scopeName: "global", parentScope: null, variables: ["x", "y", "z"] },
    { scopeName: "outer", parentScope: "global", variables: ["x", "a"] },
    { scopeName: "inner", parentScope: "outer", variables: ["x", "y", "b"] }
]));


// --- Invalid Input ---
console.log(detectVariableShadowing("invalid"));