// 🧩 PROBLEM–05: detectTDZViolations()

// Logic: This function detects Temporal Dead Zone (TDZ) violations
// and const re-assignment violations in a sequence of operations.
// It simulates the TDZ for let/const: from block start until declaration.
// safeOperations only includes variables that had NO violations at all.


function detectTDZViolations(operations) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(operations)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH OPERATION ---
    const validTypes = ["declare", "access", "assign"];
    const validKeywords = ["var", "let", "const"];

    for (const op of operations) {
        if (
            typeof op !== 'object' ||
            op === null ||
            !validTypes.includes(op.type) ||
            typeof op.name !== 'string' ||
            typeof op.order !== 'number'
        ) {
            return "Invalid Input";
        }
        if (op.type === "declare" && !validKeywords.includes(op.keyword)) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: SORT OPERATIONS BY ORDER ---
    const sortedOps = [...operations].sort((a, b) => a.order - b.order);

    // --- STEP 4: TRACK VARIABLE STATES ---
    const varState = new Map();
    const tdzViolations = [];
    const reAssignViolations = [];
    const variablesWithViolations = new Set();

    for (const op of sortedOps) {
        const { type, name, keyword, order } = op;

        if (type === "declare") {
            // Variable is declared - exits TDZ for let/const
            varState.set(name, {
                declared: true,
                keyword,
                declareOrder: order
            });
        } else if (type === "access" || type === "assign") {
            // Reading or writing a variable
            const state = varState.get(name);
            const isBeforeDeclaration = !state || !state.declared;

            if (isBeforeDeclaration) {
                // Access/assign before declaration
                // Look ahead to find the declaration keyword
                let futureKeyword = null;
                for (const futureOp of sortedOps) {
                    if (futureOp.type === "declare" && futureOp.name === name) {
                        futureKeyword = futureOp.keyword;
                        break;
                    }
                }

                if (futureKeyword === "let" || futureKeyword === "const") {
                    // TDZ violation for let/const
                    const declareOp = sortedOps.find(o => o.type === "declare" && o.name === name);
                    const declareOrder = declareOp ? declareOp.order : null;
                    tdzViolations.push({
                        name,
                        accessOrder: order,
                        declareOrder
                    });
                    variablesWithViolations.add(name);
                }
                // var or no declaration found - no violation (var is hoisted)
            } else {
                // Already declared
                if (type === "assign" && state.keyword === "const") {
                    // const re-assignment violation
                    reAssignViolations.push({
                        name,
                        assignOrder: order
                    });
                    variablesWithViolations.add(name);
                }
                // Other cases (var assign, let assign, access) - no violation
            }
        }
    }

    // --- STEP 5: DETERMINE SAFE OPERATIONS ---
    // A variable is "safe" if it was declared and had NO violations
    const safeOperations = [];
    for (const [name, state] of varState) {
        if (state.declared && !variablesWithViolations.has(name)) {
            safeOperations.push(name);
        }
    }

    // --- STEP 6: RETURN RESULTS ---
    return {
        tdzViolations,
        reAssignViolations,
        safeOperations: safeOperations.sort()
    };
}

// --- EXAMPLE USAGE ---
console.log(detectTDZViolations([
    { type: "access", name: "x", order: 1 },
    { type: "declare", keyword: "let", name: "x", order: 2 },
    { type: "declare", keyword: "const", name: "PI", order: 3 },
    { type: "assign", name: "PI", order: 4 },
    { type: "declare", keyword: "var", name: "age", order: 5 },
    { type: "access", name: "age", order: 6 }
]));


// --- Invalid Input ---
console.log(detectTDZViolations("invalid"));