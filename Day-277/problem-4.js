// PROBLEM–04: createTemplateLiteralEngine()

// Logic: Simulates TypeScript template literal types at runtime.

function createTemplateLiteralEngine(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.caseSensitive !== "boolean" ||
        typeof config.maxCombinations !== "number" ||
        !Number.isInteger(config.maxCombinations) ||
        config.maxCombinations <= 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE ENGINE STATE ---
    const templates = new Map();

    let totalCombinations = 0;
    let validations = 0;

    // --- STEP 3: EXTRACT PLACEHOLDER NAMES ---
    function getPlaceholders(template) {
        const placeholders = [];
        const regex = /\$\{([^}]+)\}/g;

        let match;

        while ((match = regex.exec(template)) !== null) {
            placeholders.push(match[1]);
        }

        return placeholders;
    }

    // --- STEP 4: GENERATE ALL COMBINATIONS ---
    function generateCombinations(
        template,
        unions,
        index = 0,
        current = ""
    ) {
        if (index === unions.length) {
            return [current];
        }

        const results = [];
        const placeholderRegex =
            /\$\{[^}]+\}/;

        const nextPlaceholder =
            template.match(placeholderRegex);

        if (!nextPlaceholder) {
            return [template];
        }

        const placeholderText =
            nextPlaceholder[0];

        const parts =
            template.split(placeholderText);

        const before = parts[0];
        const after = parts
            .slice(1)
            .join(placeholderText);

        for (const value of unions[index]) {
            const partial =
                current +
                before +
                value;

            const nestedResults =
                generateCombinations(
                    after,
                    unions,
                    index + 1,
                    partial
                );

            for (const result of nestedResults) {
                results.push(result);

                if (
                    results.length >=
                    config.maxCombinations
                ) {
                    return results;
                }
            }
        }

        return results;
    }

    // --- STEP 5: DEFINE TEMPLATE ---
    function define(name, template, unions) {
        if (
            typeof name !== "string" ||
            name.length === 0 ||
            typeof template !== "string" ||
            !Array.isArray(unions)
        ) {
            return "Invalid Input";
        }

        const placeholders =
            getPlaceholders(template);

        if (
            placeholders.length !==
            unions.length
        ) {
            return "Invalid Input";
        }

        for (const union of unions) {
            if (
                !Array.isArray(union) ||
                union.length === 0 ||
                !union.every(
                    value =>
                        typeof value === "string"
                )
            ) {
                return "Invalid Input";
            }
        }

        const combinations =
            generateCombinations(
                template,
                unions
            );

        templates.set(name, {
            name,
            template,
            unions: unions.map(union => [...union]),
            placeholders,
            combinations
        });

        totalCombinations +=
            combinations.length;

        return {
            name,
            combinations,
            count: combinations.length
        };
    }

    // --- STEP 6: VALIDATE TEMPLATE VALUE ---
    function validate(templateName, value) {
        if (typeof value !== "string") {
            return "Invalid Input";
        }

        const template =
            templates.get(templateName);

        if (!template) {
            return "Invalid Input";
        }

        validations++;

        let matchedCombination = null;

        const normalize = input =>
            config.caseSensitive
                ? input
                : input.toLowerCase();

        const normalizedValue =
            normalize(value);

        for (const combination of template.combinations) {
            if (
                normalize(combination) ===
                normalizedValue
            ) {
                matchedCombination = combination;
                break;
            }
        }

        if (!matchedCombination) {
            return {
                valid: false,
                matchedPattern: null,
                captures: null
            };
        }

        const captures = {};

        // Match the value against each template part.
        const escapedParts =
            template.template
                .split(/\$\{[^}]+\}/)
                .map(part =>
                    part.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    )
                );

        const placeholders =
            template.placeholders;

        let pattern = "";

        for (let i = 0; i < escapedParts.length; i++) {
            pattern += escapedParts[i];

            if (i < placeholders.length) {
                pattern += "(.+?)";
            }
        }

        const regex = new RegExp(
            `^${pattern}$`,
            config.caseSensitive
                ? ""
                : "i"
        );

        const match =
            value.match(regex);

        if (match) {
            placeholders.forEach(
                (placeholder, index) => {
                    captures[placeholder] =
                        match[index + 1];
                }
            );
        }

        return {
            valid: true,
            matchedPattern: template.template,
            captures
        };
    }

    // --- STEP 7: GENERATE TYPESCRIPT TYPE STRING ---
    function generate(templateName) {
        const template =
            templates.get(templateName);

        if (!template) {
            return "Invalid Input";
        }

        const values =
            template.combinations
                .map(value => `'${value}'`)
                .join(" | ");

        return `type ${template.name} = ${values}`;
    }

    // --- STEP 8: COMBINE TWO TEMPLATE PATTERNS ---
    function combine(template1, template2) {
        const first = templates.get(template1);
        const second = templates.get(template2);

        if (!first || !second) {
            return "Invalid Input";
        }

        const firstSet =
            new Set(first.combinations);

        return second.combinations.filter(
            value => firstSet.has(value)
        );
    }

    // --- STEP 9: EXTRACT CAPTURED VALUES ---
    function extract(value, template) {
        if (
            typeof value !== "string" ||
            typeof template !== "string"
        ) {
            return "Invalid Input";
        }

        const placeholders =
            getPlaceholders(template);

        const escapedParts =
            template
                .split(/\$\{[^}]+\}/)
                .map(part =>
                    part.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    )
                );

        let pattern = "";

        for (
            let i = 0;
            i < escapedParts.length;
            i++
        ) {
            pattern += escapedParts[i];

            if (i < placeholders.length) {
                pattern += "(.+?)";
            }
        }

        const regex = new RegExp(
            `^${pattern}$`,
            config.caseSensitive
                ? ""
                : "i"
        );

        const match =
            value.match(regex);

        if (!match) {
            return null;
        }

        const result = {};

        placeholders.forEach(
            (placeholder, index) => {
                result[placeholder] =
                    match[index + 1];
            }
        );

        return result;
    }

    // --- STEP 10: BUILD EVENT NAME UNION ---
    function buildEventNames(entities, actions) {
        if (
            !Array.isArray(entities) ||
            !Array.isArray(actions) ||
            entities.length === 0 ||
            actions.length === 0 ||
            !entities.every(
                item => typeof item === "string"
            ) ||
            !actions.every(
                item => typeof item === "string"
            )
        ) {
            return "Invalid Input";
        }

        const result = [];

        for (const entity of entities) {
            for (const action of actions) {
                result.push(
                    entity + action
                );
            }
        }

        return result.join(" | ");
    }

    // --- STEP 11: BUILD CSS CLASS UNION ---
    function buildCSSClasses(prefixes, sizes) {
        if (
            !Array.isArray(prefixes) ||
            !Array.isArray(sizes) ||
            prefixes.length === 0 ||
            sizes.length === 0 ||
            !prefixes.every(
                item => typeof item === "string"
            ) ||
            !sizes.every(
                item => typeof item === "string"
            )
        ) {
            return "Invalid Input";
        }

        const result = [];

        for (const prefix of prefixes) {
            for (const size of sizes) {
                result.push(
                    `${prefix}-${size}`
                );
            }
        }

        return result.join(" | ");
    }

    // --- STEP 12: GENERATE REPORT ---
    function getReport() {
        return {
            totalTemplates: templates.size,
            totalCombinations,
            validations
        };
    }

    // --- STEP 13: RETURN ENGINE API ---
    return {
        define,
        validate,
        generate,
        combine,
        extract,
        buildEventNames,
        buildCSSClasses,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const templateEngine =
    createTemplateLiteralEngine({
        caseSensitive: true,
        maxCombinations: 100
    });

console.log(
    templateEngine.define(
        "EventName",
        "${entity}${action}",
        [
            ["User", "Product", "Order"],
            ["Created", "Updated", "Deleted"]
        ]
    )
);

console.log(
    templateEngine.validate(
        "EventName",
        "UserCreated"
    )
);

console.log(
    templateEngine.validate(
        "EventName",
        "AdminDeleted"
    )
);

console.log(templateEngine.generate("EventName"));

console.log(
    templateEngine.extract(
        "getUserById",
        "${method}${Entity}By${Key}"
    )
);

console.log(
    templateEngine.buildEventNames(
        ["User", "Order"],
        ["Created", "Deleted"]
    )
);

console.log(
    templateEngine.buildCSSClasses(
        ["btn", "card"],
        ["small", "large"]
    )
);

console.log(templateEngine.getReport());