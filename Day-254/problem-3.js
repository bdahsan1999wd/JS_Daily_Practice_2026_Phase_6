// 🧩 PROBLEM–03: analyzeBlockScope()

// Logic: This function analyzes block scope boundaries for variable
// declarations. It determines which variables are accessible from each
// block, considering that let/const are block-scoped (accessible in
// nested blocks) while var leaks to the nearest function scope (or global).


function analyzeBlockScope(codeBlocks) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(codeBlocks)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH BLOCK ---
    for (const block of codeBlocks) {
        if (
            typeof block !== 'object' ||
            block === null ||
            typeof block.blockId !== 'string' ||
            (block.parentBlock !== null && typeof block.parentBlock !== 'string') ||
            !Array.isArray(block.declarations)
        ) {
            return "Invalid Input";
        }
        for (const decl of block.declarations) {
            if (
                typeof decl !== 'object' ||
                decl === null ||
                !["var", "let", "const"].includes(decl.keyword) ||
                typeof decl.name !== 'string'
            ) {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: BUILD BLOCK MAP ---
    const blockMap = new Map();
    for (const block of codeBlocks) {
        blockMap.set(block.blockId, block);
    }

    // --- STEP 4: VALIDATE PARENT BLOCKS ---
    for (const block of codeBlocks) {
        if (block.parentBlock !== null && !blockMap.has(block.parentBlock)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: FIND ROOT BLOCK (function scope) ---
    const rootBlocks = codeBlocks.filter(b => b.parentBlock === null);
    if (rootBlocks.length !== 1) {
        return "Invalid Input"; // Expect exactly one root
    }
    const rootId = rootBlocks[0].blockId;

    // --- STEP 6: COLLECT ALL VAR DECLARATIONS IN THE TREE ---
    // Var declarations anywhere in the function tree are accessible in the root
    const allVarsInTree = new Set();
    const allDeclarations = []; // { blockId, keyword, name }

    for (const block of codeBlocks) {
        for (const decl of block.declarations) {
            allDeclarations.push({ blockId: block.blockId, keyword: decl.keyword, name: decl.name });
            if (decl.keyword === "var") {
                allVarsInTree.add(decl.name);
            }
        }
    }

    // --- STEP 7: BUILD CHILDREN MAP ---
    const childrenMap = new Map();
    for (const block of codeBlocks) {
        if (!childrenMap.has(block.blockId)) {
            childrenMap.set(block.blockId, []);
        }
        if (block.parentBlock !== null) {
            if (!childrenMap.has(block.parentBlock)) {
                childrenMap.set(block.parentBlock, []);
            }
            childrenMap.get(block.parentBlock).push(block.blockId);
        }
    }

    // --- STEP 8: BUILD ACCESS MAP ---
    const blockAccessMap = {};
    const leakedVars = new Set();

    for (const block of codeBlocks) {
        const accessible = new Set();
        const blockId = block.blockId;

        // Add own declarations
        for (const decl of block.declarations) {
            accessible.add(decl.name);
        }

        if (blockId === rootId) {
            // Root (function scope): all var declarations in the tree
            for (const varName of allVarsInTree) {
                accessible.add(varName);
            }
        } else {
            // Non-root blocks: walk up parent chain
            let currentParent = block.parentBlock;
            while (currentParent !== null) {
                const parentBlock = blockMap.get(currentParent);
                if (!parentBlock) break;

                // Add parent's declarations
                for (const decl of parentBlock.declarations) {
                    if (decl.keyword === "var") {
                        accessible.add(decl.name);
                    } else {
                        // let/const accessible in nested blocks
                        accessible.add(decl.name);
                    }
                }

                currentParent = parentBlock.parentBlock;
            }
        }

        blockAccessMap[blockId] = Array.from(accessible).sort();
    }

    // --- STEP 9: IDENTIFY LEAKED VARS ---
    // A var "leaks" if it's declared in a nested block (not root)
    for (const decl of allDeclarations) {
        if (decl.keyword === "var" && decl.blockId !== rootId) {
            leakedVars.add(decl.name);
        }
    }

    // --- STEP 10: RETURN RESULTS ---
    return {
        blockAccessMap,
        leakedVars: Array.from(leakedVars).sort()
    };
}


// --- EXAMPLE USAGE ---
console.log(analyzeBlockScope([
    { blockId: "function", parentBlock: null, declarations: [{ keyword: "var", name: "a" }] },
    { blockId: "ifBlock", parentBlock: "function", declarations: [{ keyword: "let", name: "b" }, { keyword: "var", name: "c" }] },
    { blockId: "forBlock", parentBlock: "ifBlock", declarations: [{ keyword: "const", name: "d" }] }
]));


// --- Invalid Input ---
console.log(analyzeBlockScope("invalid"));