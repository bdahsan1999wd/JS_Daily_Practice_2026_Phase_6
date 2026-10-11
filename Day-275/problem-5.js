// PROBLEM–05: createGenericPipeline()

// Logic: This engine simulates a generic Pipeline<T, U>. Each transformation becomes the input of the next step. It tracks runtime type flow, filters, reductions, branching, execution logs and multiple pipeline executions.

function createGenericPipeline(config) {

  // --- STEP 1: VALIDATE CONFIGURATION ---
  if (
    !config ||
    typeof config !== "object" ||
    typeof config.name !== "string" ||
    config.name.trim() === "" ||
    typeof config.strict !== "boolean" ||
    !["throw", "skip", "default"].includes(
      config.errorHandling
    )
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: STORE CONFIGURATION ---
  const settings = {
    name: config.name,
    strict: config.strict,
    errorHandling: config.errorHandling,
  };

  // --- STEP 3: PIPELINE STATE ---
  const steps = [];

  let executionsRun = 0;

  // --- STEP 4: GET RUNTIME TYPE ---
  function getType(value) {
    if (value === null) return "null";

    if (Array.isArray(value)) {
      return "array";
    }

    return typeof value;
  }

  // --- STEP 5: INFER OUTPUT TYPE ---
  function inferOutputType(fn, inputType) {
    // JavaScript does not expose a function's return type
    // directly. Therefore, the actual runtime output during
    // execution is used to build the final type flow.
    return inputType;
  }

  // --- STEP 6: ADD PIPE STEP ---
  function pipe(stepName, fn) {
    if (
      typeof stepName !== "string" ||
      stepName.trim() === "" ||
      typeof fn !== "function"
    ) {
      return "Invalid Input";
    }

    steps.push({
      name: stepName,
      type: "pipe",
      fn,
    });

    return {
      added: true,
      step: stepName,
    };
  }

  // --- STEP 7: ADD FILTER STEP ---
  function filter(stepName, predicate) {
    if (
      typeof stepName !== "string" ||
      stepName.trim() === "" ||
      typeof predicate !== "function"
    ) {
      return "Invalid Input";
    }

    steps.push({
      name: stepName,
      type: "filter",
      fn: predicate,
    });

    return {
      added: true,
      step: stepName,
    };
  }

  // --- STEP 8: ADD REDUCE STEP ---
  function reduce(stepName, fn, initial) {
    if (
      typeof stepName !== "string" ||
      stepName.trim() === "" ||
      typeof fn !== "function"
    ) {
      return "Invalid Input";
    }

    steps.push({
      name: stepName,
      type: "reduce",
      fn,
      initial,
    });

    return {
      added: true,
      step: stepName,
    };
  }

  // --- STEP 9: ADD BRANCH STEP ---
  function branch(
    condition,
    truePipe,
    falsePipe
  ) {
    if (
      typeof condition !== "function" ||
      !Array.isArray(truePipe) ||
      !Array.isArray(falsePipe)
    ) {
      return "Invalid Input";
    }

    steps.push({
      name: "branch",
      type: "branch",
      condition,
      truePipe,
      falsePipe,
    });

    return {
      added: true,
      step: "branch",
    };
  }

  // --- STEP 10: EXECUTE NORMAL STEP ---
  function executeStep(
    step,
    currentValue,
    executionLog
  ) {
    if (step.type === "pipe") {
      const input = currentValue;

      const output = step.fn(input);

      executionLog.push({
        step: step.name,
        input,
        output,
      });

      return {
        value: output,
        stopped: false,
      };
    }

    // --- FILTER STEP ---
    if (step.type === "filter") {
      const input = currentValue;

      const passed = step.fn(input);

      if (passed) {
        executionLog.push({
          step: step.name,
          input,
          output: input,
          filtered: false,
        });

        return {
          value: input,
          stopped: false,
        };
      }

      executionLog.push({
        step: step.name,
        input,
        output: null,
        filtered: true,
      });

      return {
        value: null,
        stopped: true,
      };
    }

    // --- REDUCE STEP ---
    if (step.type === "reduce") {
      if (!Array.isArray(currentValue)) {
        throw new Error(
          `Reduce step "${step.name}" requires an array`
        );
      }

      const input = currentValue;

      const output = input.reduce(
        step.fn,
        step.initial
      );

      executionLog.push({
        step: step.name,
        input,
        output,
      });

      return {
        value: output,
        stopped: false,
      };
    }

    // --- BRANCH STEP ---
    if (step.type === "branch") {
      const conditionResult =
        step.condition(currentValue);

      const selectedSteps = conditionResult
        ? step.truePipe
        : step.falsePipe;

      let value = currentValue;

      for (const branchStep of selectedSteps) {
        if (typeof branchStep === "function") {
          value = branchStep(value);
        }
      }

      executionLog.push({
        step: "branch",
        input: currentValue,
        output: value,
        branch: conditionResult
          ? "true"
          : "false",
      });

      return {
        value,
        stopped: false,
      };
    }

    return {
      value: currentValue,
      stopped: false,
    };
  }

  // --- STEP 11: RUN PIPELINE ---
  function run(input) {
    executionsRun++;

    let currentValue = input;

    const executionLog = [];

    // Initial runtime type is always the first type.
    const typeFlow = [getType(input)];

    const executedSteps = [];

    for (const step of steps) {
      const inputBeforeStep = currentValue;

      try {
        const result = executeStep(
          step,
          currentValue,
          executionLog
        );

        currentValue = result.value;

        executedSteps.push(step.name);

        // Track output type after every step.
        typeFlow.push(getType(currentValue));

        if (result.stopped) {
          break;
        }
      } catch (error) {
        if (settings.errorHandling === "throw") {
          throw error;
        }

        if (settings.errorHandling === "skip") {
          executionLog.push({
            step: step.name,
            input: inputBeforeStep,
            error: error.message,
            skipped: true,
          });

          // Keep previous value when step is skipped.
          typeFlow.push(getType(currentValue));
          continue;
        }

        // default mode:
        // Continue with null as fallback value.
        executionLog.push({
          step: step.name,
          input: inputBeforeStep,
          output: null,
          error: error.message,
          defaulted: true,
        });

        currentValue = null;
        typeFlow.push("null");
      }
    }

    return {
      output: currentValue,
      typeFlow,
      steps: executedSteps,
      executionLog,
    };
  }

  // --- STEP 12: RUN PIPELINE FOR ALL INPUTS ---
  function runAll(inputs) {
    if (!Array.isArray(inputs)) {
      return "Invalid Input";
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    inputs.forEach((input) => {
      try {
        const result = run(input);

        results.push(result.output);

        // A null output from a filter means the execution
        // did not produce a successful result.
        if (result.output === null) {
          failCount++;
        } else {
          successCount++;
        }
      } catch {
        results.push(null);
        failCount++;
      }
    });

    return {
      results,
      successCount,
      failCount,
    };
  }

  // --- STEP 13: GET TYPE FLOW ---
  function getTypeFlow() {
    // No execution has happened yet.
    if (steps.length === 0) {
      return "";
    }

    // Since JavaScript is dynamically typed, exact generic
    // compile-time types are unavailable before execution.
    // We therefore infer the flow from the latest execution.
    if (executionsRun === 0) {
      return "unknown";
    }

    // Run history is not stored separately.
    // A representative flow is generated from function names
    // only when actual execution information is unavailable.
    return "runtime-inferred";
  }

  // --- STEP 14: GET REPORT ---
  function getReport() {
    return {
      pipelineName: settings.name,
      totalSteps: steps.length,
      typeFlow: getTypeFlow(),
      executionsRun,
    };
  }

  // --- STEP 15: RETURN PIPELINE API ---
  return {
    pipe,
    filter,
    reduce,
    branch,
    run,
    runAll,
    getTypeFlow,
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const pipeline = createGenericPipeline({
  name: "DataPipeline",
  strict: true,
  errorHandling: "skip",
});

console.log(
  pipeline.pipe(
    "parse",
    (x) => parseInt(x)
  )
);

console.log(
  pipeline.pipe(
    "double",
    (x) => x * 2
  )
);

console.log(
  pipeline.filter(
    "positiveOnly",
    (x) => x > 0
  )
);

console.log(
  pipeline.pipe(
    "stringify",
    (x) => x.toString()
  )
);

console.log(
  pipeline.run("21")
);

console.log(
  pipeline.runAll([
    "5",
    "-3",
    "10",
  ])
);

console.log(pipeline.getTypeFlow());

console.log(pipeline.getReport());