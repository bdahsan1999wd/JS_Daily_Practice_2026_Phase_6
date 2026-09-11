// 🧩 PROBLEM–01: analyzeDeclarations()

// Logic: This function analyzes variable declarations to determine their
// hoisting behavior, TDZ status, and re-declaration/re-assignment rules
// based on the keyword (var/let/const) and scope.


function analyzeDeclarations(declarations) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(declarations)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH DECLARATION ---
    const validKeywords = ["var", "let", "const"];
    const validScopes = ["global", "function", "block"];

    for (const decl of declarations) {
        if (
            typeof decl !== 'object' ||
            decl === null ||
            !validKeywords.includes(decl.keyword) ||
            typeof decl.name !== 'string' ||
            !validScopes.includes(decl.scope) ||
            typeof decl.accessedBeforeInit !== 'boolean'
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: ANALYZE EACH DECLARATION ---
    const results = [];

    for (const decl of declarations) {
        const { keyword, name, scope, accessedBeforeInit } = decl;

        // Determine hoisted value
        let hoistedValue;
        let inTDZ = false;

        if (keyword === "var") {
            hoistedValue = "undefined";
            inTDZ = false;
        } else { // let or const
            if (accessedBeforeInit) {
                hoistedValue = "ReferenceError: TDZ";
                inTDZ = true;
            } else {
                hoistedValue = null; // Not accessed before init, so no TDZ issue at access time
                inTDZ = false;
            }
        }

        // Determine re-declarable and re-assignable
        let reDeclarable, reAssignable;
        if (keyword === "var") {
            reDeclarable = true;
            reAssignable = true;
        } else if (keyword === "let") {
            reDeclarable = false;
            reAssignable = true;
        } else { // const
            reDeclarable = false;
            reAssignable = false;
        }

        results.push({
            name,
            keyword,
            scope,
            hoistedValue,
            inTDZ,
            reDeclarable,
            reAssignable
        });
    }

    // --- STEP 4: RETURN RESULTS ---
    return results;
}


// --- EXAMPLE USAGE ---
console.log(analyzeDeclarations([
    { keyword: "var", name: "age", scope: "function", accessedBeforeInit: true },
    { keyword: "let", name: "city", scope: "block", accessedBeforeInit: true },
    { keyword: "const", name: "PI", scope: "block", accessedBeforeInit: false }
]));


// --- Invalid Input ---
console.log(analyzeDeclarations("invalid"));