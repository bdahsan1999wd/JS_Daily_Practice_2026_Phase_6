// PROBLEM–03: createExceptionTester()

// Logic: This function creates an exception-testing engine that verifies specific error classes and messages, checks error-free execution, validates recovery behavior, and builds an exception-to-input map.

function createExceptionTester(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Ensure the target function and error class definitions are valid.
    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.targetFn !== "function" ||
        !Array.isArray(config.errorClasses)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE ERROR CLASS DEFINITIONS ---
    // Each error class must have a name, expected message, and optional code.
    const validErrorClass = (item) => {
        return (
            item &&
            typeof item === "object" &&
            typeof item.name === "string" &&
            item.name.trim() !== "" &&
            typeof item.message === "string" &&
            (typeof item.code === "string" || item.code === null)
        );
    };

    if (!config.errorClasses.every(validErrorClass)) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE STATE ---
    const testResults = [];
    const exceptionMap = {};
    let recoveryCount = 0;

    // --- STEP 4: CREATE SAFE EXECUTOR ---
    // Execute the target function and capture any thrown error.
    const executeTarget = (input) => {
        try {
            const args = Array.isArray(input) ? input : [input];

            return {
                threw: false,
                result: config.targetFn(...args)
            };
        } catch (error) {
            return {
                threw: true,
                error,
                result: undefined
            };
        }
    };

    // --- STEP 5: CREATE ERROR REGISTRATION HELPER ---
    // Store every input under the error class that it triggered.
    const registerException = (error, input) => {
        if (!error) {
            return;
        }

        const errorClass = error.name || error.constructor?.name || "Error";

        if (!exceptionMap[errorClass]) {
            exceptionMap[errorClass] = [];
        }

        exceptionMap[errorClass].push(input);
    };

    // --- STEP 6: DEFINE expectError METHOD ---
    // Verify both the error class and message.
    const expectError = (
        testName,
        input,
        errorClass,
        message
    ) => {
        if (
            typeof testName !== "string" ||
            typeof errorClass !== "string" ||
            typeof message !== "string"
        ) {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        let passed = false;
        let actualError;

        if (execution.threw) {
            const actualClass =
                execution.error.name ||
                execution.error.constructor?.name ||
                "Error";

            actualError = {
                type: actualClass,
                message: execution.error.message
            };

            passed =
                actualClass === errorClass &&
                execution.error.message === message;

            registerException(execution.error, input);
        }

        const result = {
            passed,
            errorClass,
            expectedMessage: message,
            actualError
        };

        testResults.push({
            type: "expectedError",
            name: testName,
            result
        });

        return result;
    };

    // --- STEP 7: DEFINE expectNoError METHOD ---
    // Verify that the target function completes without throwing.
    const expectNoError = (testName, input) => {
        if (typeof testName !== "string") {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        const result = {
            passed: !execution.threw,
            input,
            result: execution.result
        };

        if (execution.threw) {
            registerException(execution.error, input);
        }

        testResults.push({
            type: "noError",
            name: testName,
            result
        });

        return result;
    };

    // --- STEP 8: DEFINE catchAndValidate METHOD ---
    // Catch the error and pass it to a custom validator function.
    const catchAndValidate = (input, validator) => {
        if (typeof validator !== "function") {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        if (!execution.threw) {
            return {
                caught: false,
                valid: false,
                error: null
            };
        }

        registerException(execution.error, input);

        let valid = false;

        try {
            valid = Boolean(validator(execution.error));
        } catch {
            valid = false;
        }

        return {
            caught: true,
            valid,
            error: execution.error
        };
    };

    // --- STEP 9: DEFINE testErrorChain METHOD ---
    // Execute multiple inputs and compare each thrown error against
    // the corresponding expected error class.
    const testErrorChain = (inputs, expectedErrors) => {
        if (
            !Array.isArray(inputs) ||
            !Array.isArray(expectedErrors) ||
            inputs.length !== expectedErrors.length
        ) {
            return "Invalid Input";
        }

        const results = inputs.map((input, index) => {
            const execution = executeTarget(input);

            const expected = expectedErrors[index];

            const actualClass = execution.threw
                ? execution.error.name
                : null;

            const passed =
                execution.threw &&
                actualClass === expected;

            if (execution.threw) {
                registerException(execution.error, input);
            }

            return {
                input,
                expectedError: expected,
                actualError: actualClass,
                passed
            };
        });

        return {
            chainValid: results.every((result) => result.passed),
            results
        };
    };

    // --- STEP 10: DEFINE testRecovery METHOD ---
    // Verify that a thrown error can be passed to the recovery function
    // and that recovery produces a result successfully.
    const testRecovery = (input, recoveryFn) => {
        if (typeof recoveryFn !== "function") {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        if (!execution.threw) {
            return {
                errorThrown: false,
                recovered: false,
                recoveryResult: undefined
            };
        }

        registerException(execution.error, input);

        try {
            const recoveryResult = recoveryFn(execution.error);
            recoveryCount++;

            return {
                errorThrown: true,
                recovered: true,
                recoveryResult
            };
        } catch {
            return {
                errorThrown: true,
                recovered: false,
                recoveryResult: undefined
            };
        }
    };

    // --- STEP 11: DEFINE getExceptionMap METHOD ---
    // Return a copy so external code cannot directly modify the
    // internal exception tracking state.
    const getExceptionMap = () => {
        return Object.fromEntries(
            Object.entries(exceptionMap).map(([key, values]) => [
                key,
                [...values]
            ])
        );
    };

    // --- STEP 12: DEFINE getReport METHOD ---
    const getReport = () => {
        const totalTests = testResults.length;

        const passed = testResults.filter(
            (test) => test.result.passed
        ).length;

        const errorsExpected = testResults.filter(
            (test) => test.type === "expectedError"
        ).length;

        const errorsCaught = Object.values(exceptionMap)
            .reduce((total, inputs) => total + inputs.length, 0);

        return {
            totalTests,
            errorsExpected,
            errorsCaught,
            recoveries: recoveryCount,
            passRate:
                totalTests === 0
                    ? "0.00%"
                    : `${((passed / totalTests) * 100).toFixed(2)}%`
        };
    };

    // --- STEP 13: RETURN EXCEPTION TESTER API ---
    return {
        expectError,
        expectNoError,
        catchAndValidate,
        testErrorChain,
        testRecovery,
        getExceptionMap,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const tester = createExceptionTester({
    targetFn: (input) => {
        if (input === null) {
            throw new TypeError("Input cannot be null");
        }

        if (input < 0) {
            throw new RangeError("Input must be non-negative");
        }

        if (input > 1000) {
            throw new RangeError("Input exceeds maximum");
        }

        return input * 2;
    },

    errorClasses: [
        {
            name: "TypeError",
            message: "Input cannot be null",
            code: null
        },
        {
            name: "RangeError",
            message: "Input must be non-negative",
            code: null
        }
    ]
});

console.log(
    tester.expectError(
        "null input throws TypeError",
        null,
        "TypeError",
        "Input cannot be null"
    )
);

console.log(
    tester.expectError(
        "negative throws RangeError",
        -5,
        "RangeError",
        "Input must be non-negative"
    )
);

console.log(
    tester.expectNoError("valid input", 42)
);

console.log(
    tester.testRecovery(-5, () => 0)
);

console.log(tester.getExceptionMap());

console.log(tester.getReport());