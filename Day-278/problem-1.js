// PROBLEM–01: analyzeTypeSystem()

// Logic: Analyzes TypeScript definitions and produces a complete type-system report.

function analyzeTypeSystem(definitions) {

    // --- STEP 1: VALIDATE INPUT ---

    if (!Array.isArray(definitions) || definitions.length === 0) {
        return "Invalid Input";
    }

    const validKinds = [
        "type",
        "interface",
        "enum",
        "union",
        "intersection",
        "generic"
    ];

    for (const item of definitions) {
        if (
            typeof item !== "object" ||
            item === null ||
            typeof item.name !== "string" ||
            item.name.trim() === "" ||
            !validKinds.includes(item.kind) ||
            typeof item.definition !== "string" ||
            !Array.isArray(item.members) ||
            !item.members.every(member => typeof member === "string")
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 2: PREPARE ANALYSIS STORAGE ---

    const analysisMap = {};
    const complexityScores = [];

    // --- STEP 3: ANALYZE EACH DEFINITION ---

    for (const item of definitions) {
        const definition = item.definition;

        const optional = [];
        const readonly = [];
        const nullable = [];
        const generics = [];

        // Detect optional properties.
        for (const member of item.members) {
            const optionalPattern =
                new RegExp(`\\b${member}\\?\\s*:`);

            if (
                optionalPattern.test(definition) ||
                definition.includes(`${member}?`)
            ) {
                optional.push(member);
            }

            // Detect readonly properties.
            const readonlyPattern =
                new RegExp(`readonly\\s+${member}\\b`);

            if (readonlyPattern.test(definition)) {
                readonly.push(member);
            }

            // Detect nullable members.
            const memberPattern =
                new RegExp(
                    `\\b${member}\\??\\s*:\\s*([^;]+)`
                );

            const match = definition.match(memberPattern);

            if (
                match &&
                (match[1].includes("null") ||
                    match[1].includes("undefined"))
            ) {
                nullable.push(member);
            }
        }

        // Detect generic type parameters.
        const genericMatch =
            definition.match(/<([^>]+)>/);

        if (genericMatch) {
            genericMatch[1]
                .split(",")
                .map(value => value.trim())
                .filter(Boolean)
                .forEach(value => generics.push(value));
        }

        // --- STEP 4: CALCULATE COMPLEXITY ---

        let complexity =
            item.members.length * 10;

        if (generics.length > 0) {
            complexity += 20;
        }

        const hasUnion =
            definition.includes("|");

        const hasIntersection =
            definition.includes("&");

        if (hasUnion) {
            complexity += 15;
        }

        if (hasIntersection) {
            complexity += 10;
        }

        if (optional.length > 0) {
            complexity += 5;
        }

        complexity = Math.min(100, complexity);

        analysisMap[item.name] = {
            memberCount: item.members.length,
            optional,
            readonly,
            nullable,
            generics,
            complexity
        };

        complexityScores.push({
            name: item.name,
            score: complexity
        });
    }

    // --- STEP 5: BUILD REFERENCE GRAPH ---

    const names = new Set(
        definitions.map(item => item.name)
    );

    const graph = {};

    for (const item of definitions) {
        graph[item.name] = [];

        for (const name of names) {
            if (
                name !== item.name &&
                item.definition.includes(name)
            ) {
                graph[item.name].push(name);
            }
        }
    }

    // --- STEP 6: DETECT CIRCULAR REFERENCES ---

    const circularRefs = [];
    const reportedCycles = new Set();

    function findCycle(start, current, path) {
        for (const next of graph[current]) {
            if (next === start) {
                const cycle = [...path, start];
                const normalized = [...cycle].sort().join("->");

                if (!reportedCycles.has(normalized)) {
                    reportedCycles.add(normalized);
                    circularRefs.push(cycle);
                }

                continue;
            }

            if (!path.includes(next)) {
                findCycle(
                    start,
                    next,
                    [...path, next]
                );
            }
        }
    }

    for (const name of names) {
        findCycle(name, name, [name]);
    }

    // --- STEP 7: CHECK STRUCTURAL COMPATIBILITY ---

    const compatibilityMatrix = {};

    function getMemberTypes(item) {
        const result = {};

        for (const member of item.members) {
            const pattern =
                new RegExp(
                    `\\b${member}\\??\\s*:\\s*([^;}]+)`
                );

            const match =
                item.definition.match(pattern);

            if (match) {
                result[member] =
                    match[1].trim();
            }
        }

        return result;
    }

    for (const a of definitions) {
        for (const b of definitions) {
            if (a.name === b.name) {
                continue;
            }

            const aTypes = getMemberTypes(a);
            const bTypes = getMemberTypes(b);

            const bMembers =
                Object.keys(bTypes);

            const compatible =
                bMembers.length > 0 &&
                bMembers.every(
                    member =>
                        Object.prototype.hasOwnProperty.call(
                            aTypes,
                            member
                        ) &&
                        aTypes[member] === bTypes[member]
                );

            if (compatible) {
                compatibilityMatrix[
                    `${a.name}_extends_${b.name}`
                ] = true;
            }
        }
    }

    // --- STEP 8: SORT COMPLEXITY SCORES ---

    complexityScores.sort(
        (a, b) => b.score - a.score
    );

    // --- STEP 9: RETURN FINAL RESULT ---

    return {
        analysisMap,
        circularRefs,
        compatibilityMatrix,
        complexityScores
    };
}


// --- EXAMPLE USAGE ---
console.log(
    analyzeTypeSystem([
        {
            name: "User",
            kind: "interface",
            definition:
                "interface User { id: number; name: string; email?: string; }",
            members: ["id", "name", "email"]
        },
        {
            name: "AdminUser",
            kind: "intersection",
            definition:
                "type AdminUser = User & { role: string; permissions: string[] }",
            members: ["role", "permissions"]
        },
        {
            name: "Response",
            kind: "generic",
            definition:
                "type Response<T> = { data: T; status: number; message: string }",
            members: ["data", "status", "message"]
        }
    ])
);