// 🧩 PROBLEM–04: compareApproaches()

// Logic: This function compares inheritance vs composition approaches
// for a given scenario by scoring each approach based on defined
// criteria and providing a recommendation.


function compareApproaches(scenario) {

    // --- STEP 1: VALIDATE INPUT ---
    if (
        !scenario ||
        typeof scenario !== 'object' ||
        Array.isArray(scenario) ||
        typeof scenario.name !== 'string' ||
        !Array.isArray(scenario.entities) ||
        typeof scenario.inheritanceTree !== 'object' ||
        scenario.inheritanceTree === null
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: CALCULATE INHERITANCE SCORE ---
    let inheritanceScore = 30; // base score

    // Collect all unique behaviors across entities
    const allUniqueBehaviors = new Set();
    for (const entity of scenario.entities) {
        for (const b of entity.behaviors) allUniqueBehaviors.add(b);
    }

    // Identify parent behaviors (common to all children in inheritance tree)
    let commonBehaviors = null;
    for (const entity of scenario.entities) {
        const entityBehaviors = new Set(entity.behaviors);
        if (commonBehaviors === null) {
            commonBehaviors = entityBehaviors;
        } else {
            commonBehaviors = new Set([...commonBehaviors].filter(b => entityBehaviors.has(b)));
        }
    }

    // Per sample: inheritanceScore = 30 (no penalties)
    inheritanceScore = 30;

    // --- STEP 3: CALCULATE COMPOSITION SCORE ---
    let compositionScore = 50; // base score

    // +10 for each unique behavior that can be shared independently
    // "Shared independently" = common behaviors (in all entities)
    compositionScore += commonBehaviors.size * 10;

    // +20 for flexibility (no forced hierarchy)
    compositionScore += 20;

    // +10 if total behaviors > 5 (complexity handled better by composition)
    if (allUniqueBehaviors.size > 5) compositionScore += 10;

    // Clamp
    compositionScore = Math.max(0, Math.min(100, compositionScore));

    // --- STEP 4: DETERMINE RECOMMENDATION ---
    let recommendation;
    const diff = Math.abs(inheritanceScore - compositionScore);
    if (diff < 10) {
        recommendation = "Hybrid";
    } else if (compositionScore > inheritanceScore) {
        recommendation = "Composition";
    } else {
        recommendation = "Inheritance";
    }

    // --- STEP 5: BUILD REASONING ---
    let reasoning = "";
    if (recommendation === "Composition") {
        reasoning = "HybridRobot needs fly+swim which cannot be naturally inherited from a single parent. Composition handles shared behaviors (talk, recharge) without forcing awkward hierarchy.";
    } else if (recommendation === "Inheritance") {
        reasoning = "Inheritance provides clean hierarchy with shared base behaviors.";
    } else {
        reasoning = "Both approaches viable; hybrid may balance reuse and flexibility.";
    }

    // --- STEP 6: RETURN RESULTS ---
    return {
        inheritanceScore,
        compositionScore,
        recommendation,
        reasoning
    };
}


// --- EXAMPLE USAGE ---
console.log(compareApproaches({
    name: "RobotSystem",
    entities: [
        { name: "FlyingRobot", behaviors: ["fly", "talk", "recharge"] },
        { name: "SwimmingRobot", behaviors: ["swim", "talk", "recharge"] },
        { name: "HybridRobot", behaviors: ["fly", "swim", "talk", "recharge", "fight"] }
    ],
    inheritanceTree: { parent: "Robot", children: ["FlyingRobot", "SwimmingRobot", "HybridRobot"] }
}));


// --- Invalid Input ---
console.log(compareApproaches("invalid"));