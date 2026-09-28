// 🧩 PROBLEM–01: Form Schema Validator Engine

// Logic: This function creates a reusable form validator from a schema.
// It validates full form data or individual fields, supports built-in type validations (email, tel, url, password), and custom rules (minLength, maxLength, min, max, pattern, match).


function createFormValidator(schema) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(schema) || schema.length === 0) {
        return "Invalid Input";
    }

    const validTypes = ["text", "email", "number", "password", "tel", "url"];

    for (const field of schema) {
        if (
            typeof field !== 'object' || field === null ||
            typeof field.name !== 'string' ||
            !validTypes.includes(field.type) ||
            typeof field.required !== 'boolean' ||
            !Array.isArray(field.rules)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 2: BUILT-IN TYPE VALIDATORS ---
    function validateType(type, value) {
        const errors = [];

        if (type === "email") {
            if (!value.includes("@") || !value.includes(".")) {
                errors.push("Invalid email format");
            }
        }

        if (type === "tel") {
            if (!/^[\d+\- ]+$/.test(value)) {
                errors.push("Invalid phone format (only digits, +, -, spaces allowed)");
            }
        }

        if (type === "url") {
            if (!value.startsWith("http://") && !value.startsWith("https://")) {
                errors.push("URL must start with http:// or https://");
            }
        }

        if (type === "password") {
            if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
                errors.push("Must contain uppercase, lowercase, digit, and special character");
            }
        }

        return errors;
    }

    // --- STEP 3: RULE-BASED VALIDATORS ---
    function applyRules(rules, value, formData) {
        const errors = [];

        for (const r of rules) {
            if (r.rule === "minLength" && value.length < r.value) {
                errors.push(`Minimum length is ${r.value}`);
            }
            if (r.rule === "maxLength" && value.length > r.value) {
                errors.push(`Maximum length is ${r.value}`);
            }
            if (r.rule === "min" && Number(value) < r.value) {
                errors.push(`Minimum value is ${r.value}`);
            }
            if (r.rule === "max" && Number(value) > r.value) {
                errors.push(`Maximum value is ${r.value}`);
            }
            if (r.rule === "pattern") {
                const regex = new RegExp(r.value);
                if (!regex.test(value)) {
                    errors.push(`Does not match required pattern`);
                }
            }
            if (r.rule === "match") {
                if (formData && value !== formData[r.value]) {
                    errors.push(`Must match ${r.value}`);
                }
            }
        }

        return errors;
    }

    // --- STEP 4: VALIDATE SINGLE FIELD ---
    function validateField(fieldName, value, formData = {}) {
        const field = schema.find(f => f.name === fieldName);
        if (!field) return { valid: false, errors: ["Field not found"] };

        const errors = [];
        const isEmpty = value === undefined || value === null || value === "";

        // Required check
        if (field.required && isEmpty) {
            errors.push(`${fieldName} is required`);
            return { valid: false, errors };
        }

        // Skip further validation if empty and not required
        if (isEmpty) return { valid: true, errors: [] };

        const strValue = String(value);

        // Type-specific validation
        errors.push(...validateType(field.type, strValue));

        // Rule-based validation
        errors.push(...applyRules(field.rules, strValue, formData));

        return { valid: errors.length === 0, errors };
    }

    // --- STEP 5: VALIDATE FULL FORM ---
    function validate(formData) {
        if (typeof formData !== 'object' || formData === null) {
            return { valid: false, errors: { _form: ["Invalid form data"] }, passedFields: [] };
        }

        const errors = {};
        const passedFields = [];

        for (const field of schema) {
            const result = validateField(field.name, formData[field.name], formData);
            if (!result.valid) {
                errors[field.name] = result.errors;
            } else {
                passedFields.push(field.name);
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
            passedFields
        };
    }

    // --- STEP 6: ADD RULE TO EXISTING FIELD ---
    function addRule(fieldName, rule) {
        const field = schema.find(f => f.name === fieldName);
        if (!field) return "Invalid Input";
        field.rules.push(rule);
    }

    // --- STEP 7: GET CURRENT SCHEMA ---
    function getSchema() {
        return schema;
    }

    // --- STEP 8: GET REPORT ---
    function getReport() {
        const requiredCount = schema.filter(f => f.required).length;
        const ruleCount = schema.reduce((sum, f) => sum + f.rules.length, 0);

        return {
            totalFields: schema.length,
            requiredCount,
            optionalCount: schema.length - requiredCount,
            ruleCount
        };
    }

    // --- STEP 9: RETURN VALIDATOR API ---
    return { validate, validateField, addRule, getSchema, getReport };
}


// --- EXAMPLE USAGE ---
const validator = createFormValidator([
    { name: "email", type: "email", required: true, rules: [{ rule: "maxLength", value: 50 }] },
    { name: "password", type: "password", required: true, rules: [{ rule: "minLength", value: 8 }] },
    { name: "confirmPassword", type: "text", required: true, rules: [{ rule: "match", value: "password" }] },
    { name: "age", type: "number", required: false, rules: [{ rule: "min", value: 18 }, { rule: "max", value: 100 }] }
]);

console.log(validator.validate({
    email: "rahim@mail.com", password: "Pass@123",
    confirmPassword: "Pass@123", age: 25
}));

console.log(validator.validate({
    email: "invalid-email", password: "weak",
    confirmPassword: "mismatch", age: 15
}));


// --- Invalid Input ---
console.log(createFormValidator("invalid"));


// Export function for reuse in other problems
module.exports = { createFormValidator };