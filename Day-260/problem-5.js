// 🧩 PROBLEM–05: auditEncapsulation()

// Logic: This function audits class definitions for encapsulation quality.
// It checks for direct private field exposure (excluding getters), dead private fields,
// unguarded setters, and calculates an encapsulation score (0-100).


function auditEncapsulation(classes) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(classes)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH CLASS ---
    for (const cls of classes) {
        if (
            typeof cls !== 'object' ||
            cls === null ||
            typeof cls.name !== 'string' ||
            !Array.isArray(cls.fields) ||
            !Array.isArray(cls.methods) ||
            typeof cls.hasGetters !== 'boolean' ||
            typeof cls.hasSetters !== 'boolean'
        ) {
            return "Invalid Input";
        }
        for (const field of cls.fields) {
            if (!["private", "public", "protected"].includes(field.access)) return "Invalid Input";
        }
        for (const method of cls.methods) {
            if (!["private", "public", "protected"].includes(method.access)) return "Invalid Input";
        }
    }

    // --- STEP 3: AUDIT EACH CLASS ---
    const auditResults = {};
    const encapsulationScores = [];

    for (const cls of classes) {
        const issues = [];
        let score = 0;

        // +20 if any private fields exist
        const privateFields = cls.fields.filter(f => f.access === "private");
        if (privateFields.length > 0) score += 20;

        // +20 if getters used
        if (cls.hasGetters) score += 20;

        // +20 if setters used
        if (cls.hasSetters) score += 20;

        // Check for direct private exposure (excluding getter methods)
        let hasDirectExposure = false;
        for (const method of cls.methods) {
            // Only flag if it's a public method that exposes private field
            // AND it's NOT a getter (getter is the proper way to expose)
            if (method.access === "public" && method.exposesPrivateField === true) {
                const isGetter = method.methodName.startsWith("get");
                if (!isGetter) {
                    hasDirectExposure = true;
                    issues.push("Direct Private Exposure");
                    break;
                }
            }
        }
        // +20 if no direct private exposure
        if (!hasDirectExposure) score += 20;

        // Check for dead private fields
        let hasDeadPrivate = false;
        for (const field of privateFields) {
            const hasGetter = cls.methods.some(m => m.methodName.startsWith("get") && m.exposesPrivateField === true);
            const hasSetter = cls.methods.some(m => m.methodName.startsWith("set") && m.modifiesPrivateField === true);
            const hasModifier = cls.methods.some(m => m.modifiesPrivateField === true);
            if (!hasGetter && !hasSetter && !hasModifier) {
                hasDeadPrivate = true;
                issues.push(`Dead Private Field: ${field.fieldName}`);
            }
        }
        // +20 if no dead private fields
        if (!hasDeadPrivate) score += 20;

        // Check for unguarded setters
        for (const method of cls.methods) {
            if (method.methodName.startsWith("set") && method.access === "public" && !method.modifiesPrivateField) {
                issues.push("Unguarded Setter");
            }
        }

        // Check for no encapsulation (all public fields)
        const allPublic = cls.fields.every(f => f.access === "public");
        if (allPublic) issues.push("No Encapsulation");

        auditResults[cls.name] = { issues, score };
        encapsulationScores.push({ class: cls.name, score });
    }

    // --- STEP 4: CALCULATE OVERALL GRADE ---
    const avgScore = encapsulationScores.reduce((sum, s) => sum + s.score, 0) / encapsulationScores.length;
    let overallGrade;
    if (avgScore >= 90) overallGrade = "A";
    else if (avgScore >= 80) overallGrade = "B";
    else if (avgScore >= 70) overallGrade = "C";
    else if (avgScore >= 60) overallGrade = "D";
    else overallGrade = "F";

    // --- STEP 5: RETURN RESULTS ---
    return {
        auditResults,
        encapsulationScores,
        overallGrade
    };
}


// --- EXAMPLE USAGE ---
console.log(auditEncapsulation([
    {
        name: "UserAccount",
        fields: [
            { fieldName: "balance", access: "private" },
            { fieldName: "username", access: "public" }
        ],
        methods: [
            { methodName: "getBalance", access: "public", modifiesPrivateField: false, exposesPrivateField: true },
            { methodName: "deposit", access: "public", modifiesPrivateField: true, exposesPrivateField: false }
        ],
        hasGetters: true,
        hasSetters: false
    }
]));


// --- Invalid Input ---
console.log(auditEncapsulation("invalid"));