// PROBLEM–04: createDefensiveProgrammingTester()

// Logic: This function creates a defensive-programming testing engine. It validates input preconditions, output post conditions, invariants, null safety, and idempotency against configurable contracts.

function createDefensiveProgrammingTester(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.targetFn !== "function" ||
        !config.inputContract ||
        typeof config.inputContract !== "object" ||
        !Array.isArray(config.inputContract.params) ||
        !config.outputContract ||
        typeof config.outputContract !== "object" ||
        typeof config.outputContract.type !== "string" ||
        typeof config.outputContract.nullable !== "boolean" ||
        !(
            config.outputContract.schema === null ||
            typeof config.outputContract.schema === "object"
        )
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE INPUT CONTRACT ---
    // Every parameter must define a name, type, required flag,
    // and a constraints object.
    const validParam = (param) => {
        return (
            param &&
            typeof param === "object" &&
            typeof param.name === "string" &&
            typeof param.type === "string" &&
            typeof param.required === "boolean" &&
            param.constraints &&
            typeof param.constraints === "object" &&
            Array.isArray(param.constraints.enum)
        );
    };

    if (!config.inputContract.params.every(validParam)) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE REPORT STATE ---
    let totalTests = 0;
    let contractViolations = 0;
    let invariantBreaches = 0;
    let nullSafe = true;
    let idempotent = true;

    // --- STEP 4: CREATE TYPE CHECKER ---
    // Check runtime values against contract type definitions.
    const matchesType = (value, expectedType) => {
        if (expectedType === "null") {
            return value === null;
        }

        if (expectedType === "array") {
            return Array.isArray(value);
        }

        if (expectedType === "object") {
            return (
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value)
            );
        }

        return typeof value === expectedType;
    };

    // --- STEP 5: VALIDATE PARAMETER CONSTRAINTS ---
    // Validate one input parameter against its complete contract.
    const validateParam = (param, value) => {
        const violations = [];
        const constraints = param.constraints || {};

        if (
            value === null ||
            value === undefined
        ) {
            if (param.required) {
                violations.push({
                    param: param.name,
                    issue: `Required param is ${value === null ? "null" : "undefined"}`
                });
            }

            return violations;
        }

        if (!matchesType(value, param.type)) {
            violations.push({
                param: param.name,
                issue: `Expected type ${param.type}`
            });

            return violations;
        }

        if (
            typeof constraints.min === "number" &&
            typeof value === "number" &&
            value < constraints.min
        ) {
            violations.push({
                param: param.name,
                issue: `Value is below minimum ${constraints.min}`
            });
        }

        if (
            typeof constraints.max === "number" &&
            typeof value === "number" &&
            value > constraints.max
        ) {
            violations.push({
                param: param.name,
                issue: `Value exceeds maximum ${constraints.max}`
            });
        }

        if (
            typeof constraints.pattern === "string" &&
            typeof value === "string"
        ) {
            let pattern;

            try {
                pattern = new RegExp(constraints.pattern);

                if (!pattern.test(value)) {
                    violations.push({
                        param: param.name,
                        issue: "Value does not match pattern"
                    });
                }
            } catch {
                violations.push({
                    param: param.name,
                    issue: "Invalid contract pattern"
                });
            }
        }

        if (
            Array.isArray(constraints.enum) &&
            constraints.enum.length > 0 &&
            !constraints.enum.includes(value)
        ) {
            violations.push({
                param: param.name,
                issue: "Value is not in enum"
            });
        }

        return violations;
    };

    // --- STEP 6: DEFINE testPreconditions METHOD ---
    // Validate all input parameters before executing the target function.
    const testPreconditions = (
        testName,
        inputs,
        shouldPass
    ) => {
        if (
            typeof testName !== "string" ||
            !Array.isArray(inputs) ||
            typeof shouldPass !== "boolean"
        ) {
            return "Invalid Input";
        }

        totalTests++;

        const violations = [];

        config.inputContract.params.forEach((param, index) => {
            violations.push(
                ...validateParam(param, inputs[index])
            );
        });

        const contractPasses = violations.length === 0;

        const result = config.targetFn(...inputs);

        const passed =
            contractPasses === shouldPass;

        if (!passed) {
            contractViolations++;
        }

        return {
            passed,
            violations,
            result
        };
    };

    // --- STEP 7: CREATE OUTPUT VALIDATOR ---
    // Validate output type, nullability, and optional object schema.
    const validateOutput = (output) => {
        const violations = [];

        if (output === null || output === undefined) {
            if (!config.outputContract.nullable) {
                violations.push({
                    issue: "Output cannot be null or undefined"
                });
            }

            return violations;
        }

        if (!matchesType(output, config.outputContract.type)) {
            violations.push({
                issue: `Expected output type ${config.outputContract.type}`
            });

            return violations;
        }

        const schema = config.outputContract.schema;

        if (
            schema &&
            typeof output === "object" &&
            !Array.isArray(output)
        ) {
            Object.entries(schema).forEach(
                ([key, expectedType]) => {
                    if (!matchesType(output[key], expectedType)) {
                        violations.push({
                            field: key,
                            issue: `Expected type ${expectedType}`
                        });
                    }
                }
            );
        }

        return violations;
    };

    // --- STEP 8: DEFINE test Post conditions METHOD ---
    // Execute the function and verify that its output satisfies
    // the configured output contract.
    const testPostconditions = (testName, inputs) => {
        if (
            typeof testName !== "string" ||
            !Array.isArray(inputs)
        ) {
            return "Invalid Input";
        }

        totalTests++;

        let output;

        try {
            output = config.targetFn(...inputs);
        } catch (error) {
            contractViolations++;

            return {
                passed: false,
                output: undefined,
                violations: [
                    {
                        issue: "Target function threw an error"
                    }
                ]
            };
        }

        const violations = validateOutput(output);
        const passed = violations.length === 0;

        if (!passed) {
            contractViolations++;
        }

        return {
            passed,
            output,
            violations
        };
    };

    // --- STEP 9: DEFINE testInvariant METHOD ---
    // The invariant must be true both before and after the state mutation.
    const testInvariant = (
        testName,
        stateMutationFn,
        invariantFn
    ) => {
        if (
            typeof testName !== "string" ||
            typeof stateMutationFn !== "function" ||
            typeof invariantFn !== "function"
        ) {
            return "Invalid Input";
        }

        totalTests++;

        let state;

        try {
            state = stateMutationFn();
        } catch {
            invariantBreaches++;

            return {
                held: false,
                before: undefined,
                after: undefined,
                invariantBroken: true
            };
        }

        const before = state;

        let beforeValid = false;

        try {
            beforeValid = Boolean(invariantFn(before));
        } catch {
            beforeValid = false;
        }

        let after;

        try {
            after = stateMutationFn(state);
        } catch {
            invariantBreaches++;

            return {
                held: false,
                before,
                after: undefined,
                invariantBroken: true
            };
        }

        let afterValid = false;

        try {
            afterValid = Boolean(invariantFn(after));
        } catch {
            afterValid = false;
        }

        const held = beforeValid && afterValid;

        if (!held) {
            invariantBreaches++;
        }

        return {
            held,
            before,
            after,
            invariantBroken: !held
        };
    };

    // --- STEP 10: DEFINE testNullSafety METHOD ---
    // Execute the target function against every supplied null-like input.
    const testNullSafety = (inputs) => {
        if (!Array.isArray(inputs)) {
            return "Invalid Input";
        }

        totalTests++;

        const crashedOn = [];
        const handledGracefully = [];

        inputs.forEach((input) => {
            try {
                const result = config.targetFn(input);

                if (result === "Invalid Input") {
                    handledGracefully.push(input);
                } else {
                    handledGracefully.push(input);
                }
            } catch {
                crashedOn.push(input);
            }
        });

        nullSafe = crashedOn.length === 0;

        return {
            safe: nullSafe,
            crashedOn,
            handledGracefully
        };
    };

    // --- STEP 11: DEFINE testIdempotency METHOD ---
    // Run the same input twice and compare both results deeply.
    const testIdempotency = (input) => {
        totalTests++;

        let firstResult;
        let secondResult;

        try {
            firstResult = config.targetFn(input);
            secondResult = config.targetFn(input);
        } catch {
            idempotent = false;

            return {
                idempotent: false,
                firstResult,
                secondResult
            };
        }

        const sameResult =
            JSON.stringify(firstResult) ===
            JSON.stringify(secondResult);

        idempotent = sameResult;

        return {
            idempotent: sameResult,
            firstResult,
            secondResult
        };
    };

    // --- STEP 12: DEFINE generateContractReport METHOD ---
    // Return a detailed snapshot of the contract-testing state.
    const generateContractReport = () => {
        return {
            inputContract: config.inputContract,
            outputContract: config.outputContract,
            totalTests,
            contractViolations,
            invariantBreaches,
            nullSafe,
            idempotent
        };
    };

    // --- STEP 13: DEFINE getReport METHOD ---
    const getReport = () => {
        return {
            totalTests,
            contractViolations,
            invariantBreaches,
            nullSafe,
            idempotent
        };
    };

    // --- STEP 14: RETURN DEFENSIVE TESTER API ---
    return {
        testPreconditions,
        testPostconditions,
        testInvariant,
        testNullSafety,
        testIdempotency,
        generateContractReport,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const tester = createDefensiveProgrammingTester({
    targetFn: (user) => {
        if (!user || typeof user.name !== "string") {
            return "Invalid Input";
        }

        return {
            ...user,
            name: user.name.trim().toUpperCase()
        };
    },

    inputContract: {
        params: [
            {
                name: "user",
                type: "object",
                required: true,
                constraints: {
                    min: null,
                    max: null,
                    pattern: null,
                    enum: []
                }
            }
        ]
    },

    outputContract: {
        type: "object",
        nullable: false,
        schema: {
            name: "string"
        }
    }
});

console.log(
    tester.testPreconditions(
        "valid user passes",
        [{ name: "Rahim" }],
        true
    )
);

console.log(
    tester.testPreconditions(
        "null user fails",
        [null],
        false
    )
);

console.log(
    tester.testPostconditions(
        "output is uppercase",
        [{ name: "  rahim  " }]
    )
);

console.log(
    tester.testIdempotency({
        name: "Rahim"
    })
);

console.log(
    tester.testNullSafety([
        null,
        undefined,
        {},
        { name: null }
    ])
);

console.log(tester.getReport());