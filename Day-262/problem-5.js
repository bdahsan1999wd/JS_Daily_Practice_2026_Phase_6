// 🧩 PROBLEM–05: createBehaviorPipeline()

// Logic: This function creates a behavior pipeline that composes
// transformation functions in sequential, parallel, or conditional modes.
// It tracks execution order, skipped behaviors, and supports priority ordering.


function createBehaviorPipeline(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.name !== 'string' ||
        !["sequential", "parallel", "conditional"].includes(config.mode)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PIPELINE STATE ---
    const behaviors = []; // Array of { name, fn, condition, priority }

    // --- STEP 3: DEFINE ADDBEHAVIOR ---
    function addBehavior(behaviorUnit) {
        if (
            !behaviorUnit ||
            typeof behaviorUnit.name !== 'string' ||
            typeof behaviorUnit.fn !== 'function'
        ) {
            return "Invalid Behavior";
        }

        // Check for duplicate name
        if (behaviors.some(b => b.name === behaviorUnit.name)) {
            return "Behavior Name Exists";
        }

        const behavior = {
            name: behaviorUnit.name,
            fn: behaviorUnit.fn,
            condition: behaviorUnit.condition || (() => true),
            priority: typeof behaviorUnit.priority === 'number' ? behaviorUnit.priority : 0
        };

        behaviors.push(behavior);
        // Sort by priority (lower first)
        behaviors.sort((a, b) => a.priority - b.priority);
    }

    // --- STEP 4: DEFINE REMOVEBEHAVIOR ---
    function removeBehavior(name) {
        const idx = behaviors.findIndex(b => b.name === name);
        if (idx === -1) return false;
        behaviors.splice(idx, 1);
        return true;
    }

    // --- STEP 5: DEFINE RUN ---
    function run(input) {
        const executionLog = [];
        const skipped = [];
        let currentInput = input;

        if (config.mode === "sequential") {
            // Each behavior's output feeds into next
            for (const behavior of behaviors) {
                if (behavior.condition(currentInput)) {
                    currentInput = behavior.fn(currentInput, {});
                    executionLog.push(behavior.name);
                } else {
                    skipped.push(behavior.name);
                }
            }
        } else if (config.mode === "parallel") {
            // All behaviors run on original input, results merged by priority
            const results = [];
            for (const behavior of behaviors) {
                if (behavior.condition(input)) {
                    const result = behavior.fn(input, {});
                    results.push({ name: behavior.name, result, priority: behavior.priority });
                    executionLog.push(behavior.name);
                } else {
                    skipped.push(behavior.name);
                }
            }
            // Merge results by priority (higher priority overwrites)
            results.sort((a, b) => b.priority - a.priority);
            currentInput = { ...input };
            for (const r of results) {
                currentInput = { ...currentInput, ...r.result };
            }
        } else if (config.mode === "conditional") {
            // Behaviors run only if condition passes
            for (const behavior of behaviors) {
                if (behavior.condition(currentInput)) {
                    currentInput = behavior.fn(currentInput, {});
                    executionLog.push(behavior.name);
                } else {
                    skipped.push(behavior.name);
                }
            }
        }

        return {
            finalOutput: currentInput,
            executionLog,
            skipped
        };
    }

    // --- STEP 6: DEFINE GETBEHAVIORS ---
    function getBehaviors() {
        return behaviors.map(b => b.name);
    }

    // --- STEP 7: DEFINE RESET ---
    function reset() {
        behaviors.length = 0;
    }

    // --- STEP 8: RETURN API ---
    return {
        addBehavior,
        removeBehavior,
        run,
        getBehaviors,
        reset
    };
}


// --- EXAMPLE USAGE ---
const pipeline = createBehaviorPipeline({ name: "DataPipeline", mode: "sequential" });

pipeline.addBehavior({ name: "trim", fn: (input) => ({ ...input, name: input.name.trim() }) });
pipeline.addBehavior({ name: "uppercase", fn: (input) => ({ ...input, name: input.name.toUpperCase() }) });
pipeline.addBehavior({ name: "addPrefix", fn: (input) => ({ ...input, name: "USER_" + input.name }) });

console.log(pipeline.run({ name: "  rahim  ", age: 25 }));
console.log(pipeline.getBehaviors());

// --- Invalid Input ---
console.log(createBehaviorPipeline("invalid"));