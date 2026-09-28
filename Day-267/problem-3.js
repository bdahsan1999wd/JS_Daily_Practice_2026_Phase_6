const { createFormValidator } = require("./problem-1");

// 🧩 PROBLEM–03: 🧩 Multi-Step Form Controller

// Logic: This function creates a multi-step form controller. Each step has its own fields and validation. It supports sequential navigation (next/prev), dependency checking between steps, optional step skipping, and collects all submitted data across completed steps.

function createMultiStepForm(steps) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(steps) || steps.length === 0) {
        return "Invalid Input";
    }

    for (const step of steps) {
        if (
            typeof step !== 'object' || step === null ||
            typeof step.stepId !== 'string' ||
            typeof step.title !== 'string' ||
            !Array.isArray(step.fields) ||
            typeof step.canSkip !== 'boolean' ||
            (step.dependsOn !== null && typeof step.dependsOn !== 'string')
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 2: INTERNAL STATE ---
    let currentIndex = 0;
    const collectedData = {};         // All form data across completed steps
    const completedSteps = new Set(); // Track completed stepIds

    // --- STEP 3: REUSE VALIDATOR FROM P-01 ---
    function validateStepData(fields, formData) {
        const validator = createFormValidator(fields);
        if (validator === "Invalid Input") return { valid: true, errors: {} }; // No fields = pass
        return validator.validate(formData);
    }

    // --- STEP 4: GET CURRENT STEP ---
    function getCurrentStep() {
        const step = steps[currentIndex];
        return {
            stepId: step.stepId,
            title: step.title,
            fields: step.fields,
            progress: { current: currentIndex + 1, total: steps.length }
        };
    }

    // --- STEP 5: NEXT ---
    function next(formData) {
        const currentStep = steps[currentIndex];
        const result = validateStepData(currentStep.fields, formData);

        if (!result.valid) {
            return { success: false, errors: result.errors, nextStep: null };
        }

        // Save data from this step
        Object.assign(collectedData, formData);
        completedSteps.add(currentStep.stepId);

        // Check if last step
        if (currentIndex === steps.length - 1) {
            return { success: true, errors: {}, completed: true };
        }

        currentIndex++;
        return { success: true, errors: {}, nextStep: steps[currentIndex].stepId };
    }

    // --- STEP 6: PREV ---
    function prev() {
        if (currentIndex === 0) return null;
        currentIndex--;
        const step = steps[currentIndex];
        return { stepId: step.stepId, title: step.title };
    }

    // --- STEP 7: GOTO ---
    function goTo(stepId) {
        const targetIndex = steps.findIndex(s => s.stepId === stepId);
        if (targetIndex === -1) return "Invalid Input";

        const targetStep = steps[targetIndex];

        // Check dependency
        if (targetStep.dependsOn && !completedSteps.has(targetStep.dependsOn)) {
            return { success: false, reason: `Dependency "${targetStep.dependsOn}" not completed` };
        }

        currentIndex = targetIndex;
        return { success: true, stepId };
    }

    // --- STEP 8: SKIP ---
    function skip() {
        const currentStep = steps[currentIndex];

        if (!currentStep.canSkip) {
            return { success: false, reason: "This step cannot be skipped" };
        }

        completedSteps.add(currentStep.stepId);

        if (currentIndex === steps.length - 1) {
            return { success: true, completed: true };
        }

        currentIndex++;
        return { success: true, nextStep: steps[currentIndex].stepId };
    }

    // --- STEP 9: GET PROGRESS ---
    function getProgress() {
        return {
            currentStep: currentIndex + 1,
            totalSteps: steps.length,
            completedSteps: completedSteps.size,
            percent: parseFloat(((completedSteps.size / steps.length) * 100).toFixed(2))
        };
    }

    // --- STEP 10: GET FORM DATA ---
    function getFormData() {
        return { ...collectedData };
    }

    // --- STEP 11: RESET ---
    function reset() {
        currentIndex = 0;
        completedSteps.clear();
        for (const key of Object.keys(collectedData)) {
            delete collectedData[key];
        }
    }

    // --- STEP 12: RETURN FORM CONTROLLER API ---
    return { getCurrentStep, next, prev, goTo, skip, getProgress, getFormData, reset };
}


// --- EXAMPLE USAGE ---
const form = createMultiStepForm([
    {
        stepId: "personal", title: "Personal Info", canSkip: false, dependsOn: null,
        fields: [{ name: "name", type: "text", required: true, rules: [{ rule: "minLength", value: 2 }] }]
    },
    {
        stepId: "contact", title: "Contact Info", canSkip: false, dependsOn: "personal",
        fields: [{ name: "email", type: "email", required: true, rules: [] }]
    },
    {
        stepId: "preferences", title: "Preferences", canSkip: true, dependsOn: "contact",
        fields: [{ name: "theme", type: "text", required: false, rules: [] }]
    }
]);


console.log(form.getCurrentStep());
console.log(form.next({ name: "Rahim" }));
console.log(form.next({ email: "bad-email" }));
console.log(form.next({ email: "rahim@mail.com" }));
console.log(form.skip());
console.log(form.getFormData());
console.log(form.getProgress());

// --- Invalid Input ---
console.log(createMultiStepForm("invalid"));