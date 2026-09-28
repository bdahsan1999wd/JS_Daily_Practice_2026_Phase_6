// 🧩 PROBLEM–04: Dynamic Form Builder Engine

// Logic: This function creates a dynamic form builder that manages field configs, supports conditional field visibility based on other field values, generates HTML output, and produces a structured form schema descriptor.

function createDynamicFormBuilder(config) {

    // --- STEP 1: VALIDATE INPUT ---
    const validMethods = ["GET", "POST", "PUT", "PATCH"];

    if (
        typeof config !== 'object' || config === null ||
        typeof config.formId !== 'string' ||
        !validMethods.includes(config.method) ||
        typeof config.action !== 'string' ||
        typeof config.autoValidate !== 'boolean'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL STORAGE ---
    const fields = []; // Array of fieldConfig objects

    // --- STEP 3: ADD FIELD ---
    function addField(fieldConfig) {
        if (typeof fieldConfig !== 'object' || !fieldConfig.name || !fieldConfig.type) {
            return "Invalid Input";
        }
        // Avoid duplicates
        if (fields.find(f => f.name === fieldConfig.name)) {
            return "Invalid Input";
        }
        fields.push({ ...fieldConfig });
    }

    // --- STEP 4: REMOVE FIELD ---
    function removeField(name) {
        const index = fields.findIndex(f => f.name === name);
        if (index === -1) return "Invalid Input";
        fields.splice(index, 1);
    }

    // --- STEP 5: UPDATE FIELD ---
    function updateField(name, updates) {
        const field = fields.find(f => f.name === name);
        if (!field) return "Invalid Input";
        Object.assign(field, updates);
    }

    // --- STEP 6: GET VISIBLE FIELDS ---
    function getVisibleFields(currentValues = {}) {
        return fields
            .filter(f => {
                // No dependency = always visible
                if (!f.dependsOnField) return true;
                // Has dependency = visible only if condition met
                return currentValues[f.dependsOnField] === f.dependsOnValue;
            })
            .map(f => f.name);
    }

    // --- STEP 7: BUILD SCHEMA ---
    function buildSchema() {
        return {
            formId: config.formId,
            method: config.method,
            action: config.action,
            fields: fields.map(f => ({ ...f }))
        };
    }

    // --- STEP 8: GENERATE HTML ---
    function generateHTML() {
        const attrs = [
            `id="${config.formId}"`,
            `method="${config.method}"`,
            `action="${config.action}"`,
            config.autoValidate ? 'novalidate' : ''
        ].filter(Boolean).join(" ");

        let html = `<form ${attrs}>\n`;

        for (const f of fields) {
            html += `  <div class="field-group">\n`;
            html += `    <label for="${f.name}">${f.label || f.name}</label>\n`;

            if (f.type === "select") {
                html += `    <select id="${f.name}" name="${f.name}"${f.required ? ' required' : ''}>\n`;
                (f.options || []).forEach(opt => {
                    const selected = f.defaultValue === opt ? ' selected' : '';
                    html += `      <option value="${opt}"${selected}>${opt}</option>\n`;
                });
                html += `    </select>\n`;
            } else if (f.type === "radio" || f.type === "checkbox") {
                (f.options || []).forEach(opt => {
                    html += `    <input type="${f.type}" id="${f.name}_${opt}" name="${f.name}" value="${opt}"${f.required ? ' required' : ''}> ${opt}<br>\n`;
                });
            } else {
                html += `    <input type="${f.type}" id="${f.name}" name="${f.name}"`;
                if (f.placeholder) html += ` placeholder="${f.placeholder}"`;
                if (f.defaultValue) html += ` value="${f.defaultValue}"`;
                if (f.required) html += ` required`;
                html += `>\n`;
            }

            html += `  </div>\n`;
        }

        html += `  <button type="submit">Submit</button>\n</form>`;
        return html;
    }

    // --- STEP 9: GET REPORT ---
    function getReport() {
        const byType = {};
        let conditionalCount = 0;

        for (const f of fields) {
            byType[f.type] = (byType[f.type] || 0) + 1;
            if (f.dependsOnField) conditionalCount++;
        }

        return {
            totalFields: fields.length,
            requiredCount: fields.filter(f => f.required).length,
            conditionalCount,
            byType
        };
    }

    // --- STEP 10: RETURN BUILDER API ---
    return { addField, removeField, updateField, getVisibleFields, buildSchema, generateHTML, getReport };
}


// --- EXAMPLE USAGE ---
const builder = createDynamicFormBuilder({
    formId: "regForm", method: "POST", action: "/register", autoValidate: true
});


builder.addField({
    name: "name", type: "text", label: "Full Name", placeholder: "Enter name",
    required: true, defaultValue: "", options: [], dependsOnField: null, dependsOnValue: null
});

builder.addField({
    name: "accountType", type: "select", label: "Account Type", placeholder: "",
    required: true, defaultValue: "personal", options: ["personal", "business"],
    dependsOnField: null, dependsOnValue: null
});

builder.addField({
    name: "companyName", type: "text", label: "Company Name", placeholder: "Enter company",
    required: true, defaultValue: "", options: [], dependsOnField: "accountType", dependsOnValue: "business"
});


console.log(builder.getVisibleFields({ accountType: "personal" }));
console.log(builder.getVisibleFields({ accountType: "business" }));
console.log(builder.getReport());


// --- Invalid Input ---
console.log(createDynamicFormBuilder("invalid"));