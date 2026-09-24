// 🧩 PROBLEM–01: analyzeOOPStructure()

// Logic: This function analyzes OOP structure definitions to build prototype chains, detect method shadowing, missing private field encapsulation, and calculate OOP scores per definition.

function analyzeOOPStructure(definitions) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(definitions)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH DEFINITION ---
    for (const def of definitions) {
        if (
            typeof def !== 'object' ||
            def === null ||
            typeof def.name !== 'string' ||
            !["constructor", "class", "object.create"].includes(def.type) ||
            (def.parent !== null && typeof def.parent !== 'string') ||
            !Array.isArray(def.ownMethods) ||
            !Array.isArray(def.protoMethods) ||
            !Array.isArray(def.privateFields) ||
            !Array.isArray(def.staticMethods)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD DEFINITION MAP ---
    const defMap = new Map();
    for (const def of definitions) {
        defMap.set(def.name, def);
    }

    // --- STEP 4: VALIDATE PARENT REFERENCES ---
    for (const def of definitions) {
        if (def.parent !== null && !defMap.has(def.parent)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: BUILD PROTOTYPE CHAINS ---
    const chainMap = {};

    function buildChain(name) {
        if (chainMap[name]) return chainMap[name];

        const def = defMap.get(name);
        if (!def || def.parent === null) {
            chainMap[name] = [name];
        } else {
            chainMap[name] = [name, ...buildChain(def.parent)];
        }
        return chainMap[name];
    }

    for (const def of definitions) {
        buildChain(def.name);
    }

    // --- STEP 6: DETECT SHADOWED METHODS ---
    const shadowedMethods = [];

    for (const def of definitions) {
        if (def.parent !== null) {
            const parent = defMap.get(def.parent);
            if (parent) {
                const parentMethods = new Set(parent.protoMethods);
                for (const method of def.protoMethods) {
                    if (parentMethods.has(method)) {
                        shadowedMethods.push({
                            method,
                            child: def.name,
                            parent: parent.name
                        });
                    }
                }
            }
        }
    }

    // --- STEP 7: CALCULATE OOP SCORES ---
    const oopScores = [];

    for (const def of definitions) {
        let score = 0;

        // +20 if has private fields
        if (def.privateFields.length > 0) score += 20;

        // +20 if has getters/setters (protoMethods includes "get*" or "set*")
        const hasGetterSetter = def.protoMethods.some(m => m.startsWith("get") || m.startsWith("set"));
        if (hasGetterSetter) score += 20;

        // +20 if inherits from parent
        if (def.parent !== null) score += 20;

        // +20 if has static methods
        if (def.staticMethods.length > 0) score += 20;

        // +20 if no direct private field exposure
        // Check if any public method exposes private field without getter
        // For simplicity, we'll assume proper encapsulation if private fields exist and getters exist
        let hasDirectExposure = false;
        if (def.privateFields.length > 0 && !hasGetterSetter) {
            hasDirectExposure = true;
        }
        if (!hasDirectExposure) score += 20;

        oopScores.push({ name: def.name, score });
    }

    // --- STEP 8: CALCULATE OVERALL GRADE ---
    const avgScore = oopScores.reduce((sum, s) => sum + s.score, 0) / oopScores.length;
    let overallGrade;
    if (avgScore >= 90) overallGrade = "A";
    else if (avgScore >= 80) overallGrade = "B";
    else if (avgScore >= 70) overallGrade = "C";
    else if (avgScore >= 60) overallGrade = "D";
    else overallGrade = "F";

    // --- STEP 9: RETURN RESULTS ---
    return {
        chainMap,
        shadowedMethods,
        oopScores,
        overallGrade
    };
}

// --- EXAMPLE USAGE ---
console.log(analyzeOOPStructure([
    { name: "Animal", type: "class", parent: null, ownMethods: ["breathe"], protoMethods: ["speak", "getAge"], privateFields: ["#age"], staticMethods: ["create"] },
    { name: "Dog", type: "class", parent: "Animal", ownMethods: ["fetch"], protoMethods: ["speak", "bark", "getBreed"], privateFields: ["#breed"], staticMethods: [] }
]));


// --- Invalid Input ---
console.log(analyzeOOPStructure("invalid"));