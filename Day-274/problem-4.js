// PROBLEM–04: Discriminated Union Pattern Engine


function createDiscriminatedUnionEngine(variants) {
    // --- STEP 1: VALIDATE MAIN INPUT ---
    if (!Array.isArray(variants) || variants.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE VARIANTS ---
    for (const variant of variants) {
        if (
            !variant ||
            typeof variant !== "object" ||
            typeof variant.tag !== "string" ||
            variant.tag.trim() === "" ||
            typeof variant.discriminantProperty !==
            "string" ||
            variant.discriminantProperty.trim() === "" ||
            !variant.properties ||
            typeof variant.properties !== "object" ||
            Array.isArray(variant.properties)
        ) {
            return "Invalid Input";
        }

        for (const [property, type] of Object.entries(
            variant.properties
        )) {
            if (
                typeof property !== "string" ||
                typeof type !== "string" ||
                type.trim() === ""
            ) {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: SAME DISCRIMINANT PROPERTY REQUIRED ---
    const discriminantProperty =
        variants[0].discriminantProperty;

    if (
        variants.some(
            (variant) =>
                variant.discriminantProperty !==
                discriminantProperty
        )
    ) {
        return "Invalid Input";
    }

    // --- STEP 4: UNIQUE TAGS ---
    const tags = variants.map(
        (variant) => variant.tag
    );

    if (new Set(tags).size !== tags.length) {
        return "Invalid Input";
    }

    // --- STEP 5: INTERNAL VARIANT STORE ---
    const variantMap = new Map();

    for (const variant of variants) {
        variantMap.set(variant.tag, {
            tag: variant.tag,
            discriminantProperty:
                variant.discriminantProperty,
            properties: {
                ...variant.properties
            }
        });
    }

    // --- STEP 6: RUNTIME TYPE MATCHER ---
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
                typeof value === "object"
            );
        }

        return typeof value === expectedType;
    };

    // --- STEP 7: RETURN ENGINE API ---
    return {

        // validate(value)
        validate(value) {
            if (
                !value ||
                typeof value !== "object" ||
                Array.isArray(value)
            ) {
                return {
                    matched: false,
                    variant: null,
                    valid: false,
                    errors: {
                        value: "Expected an object"
                    }
                };
            }

            const tag =
                value[discriminantProperty];

            const variant = variantMap.get(tag);

            // Unknown discriminant
            if (!variant) {
                return {
                    matched: false,
                    variant: null,
                    valid: false,
                    errors: {
                        [discriminantProperty]:
                            `Unknown variant: ${tag}`
                    }
                };
            }

            const errors = {};

            // Check every required property.
            for (const [property, expectedType] of Object.entries(
                variant.properties
            )) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        value,
                        property
                    )
                ) {
                    errors[property] =
                        "Required property missing";
                    continue;
                }

                if (
                    !matchesType(
                        value[property],
                        expectedType
                    )
                ) {
                    errors[property] =
                        `Expected ${expectedType}`;
                }
            }

            return {
                matched: true,
                variant: variant.tag,
                valid: Object.keys(errors).length === 0,
                errors
            };
        },


        // narrow(value)
        narrow(value) {
            const result = this.validate(value);

            if (!result.matched) {
                return {
                    narrowedType: null,
                    properties: null
                };
            }

            const variant =
                variantMap.get(result.variant);

            return {
                narrowedType: result.variant,
                properties: {
                    ...variant.properties
                }
            };
        },


        // match(value, handlers)

        match(value, handlers) {
            if (
                !handlers ||
                typeof handlers !== "object"
            ) {
                return "Invalid Input";
            }

            const validation = this.validate(value);

            if (!validation.matched) {
                if (typeof handlers.default === "function") {
                    return handlers.default(value);
                }

                return "Invalid Input";
            }

            const handler =
                handlers[validation.variant];

            if (typeof handler !== "function") {
                if (typeof handlers.default === "function") {
                    return handlers.default(value);
                }

                return "Invalid Input";
            }

            return handler(value);
        },

        // exhaustive(handlers)
        exhaustive(handlers) {
            if (
                !handlers ||
                typeof handlers !== "object"
            ) {
                return "Invalid Input";
            }

            const missingHandlers = tags.filter(
                (tag) =>
                    typeof handlers[tag] !== "function"
            );

            return {
                exhaustive:
                    missingHandlers.length === 0,
                missingHandlers
            };
        },

        // generate()
        generate() {
            const lines = variants.map((variant) => {
                const properties = [
                    `${discriminantProperty}: '${variant.tag}'`,
                    ...Object.entries(
                        variant.properties
                    ).map(
                        ([property, type]) =>
                            `${property}: ${type}`
                    )
                ];

                return `  | { ${properties.join("; ")} }`;
            });

            return `type Shape =\n${lines.join("\n")}`;
        },

        // addVariant(tag, properties)
        addVariant(tag, properties) {
            if (
                typeof tag !== "string" ||
                tag.trim() === "" ||
                !properties ||
                typeof properties !== "object" ||
                Array.isArray(properties)
            ) {
                return "Invalid Input";
            }

            if (variantMap.has(tag)) {
                return "Invalid Input";
            }

            for (const [property, type] of Object.entries(
                properties
            )) {
                if (
                    typeof property !== "string" ||
                    typeof type !== "string" ||
                    type.trim() === ""
                ) {
                    return "Invalid Input";
                }
            }

            variantMap.set(tag, {
                tag,
                discriminantProperty,
                properties: {
                    ...properties
                }
            });

            tags.push(tag);

            return {
                tag,
                discriminantProperty,
                properties: {
                    ...properties
                }
            };
        },

        // getReport()
        getReport() {
            return {
                totalVariants: variantMap.size,
                discriminantProperty,
                variantTags: [...variantMap.keys()]
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const discriminatedEngine =
    createDiscriminatedUnionEngine([
        {
            tag: "circle",
            discriminantProperty: "kind",
            properties: {
                radius: "number"
            }
        },
        {
            tag: "rectangle",
            discriminantProperty: "kind",
            properties: {
                width: "number",
                height: "number"
            }
        },
        {
            tag: "triangle",
            discriminantProperty: "kind",
            properties: {
                base: "number",
                height: "number"
            }
        }
    ]);

console.log(
    discriminatedEngine.validate({
        kind: "circle",
        radius: 10
    })
);

console.log(
    discriminatedEngine.validate({
        kind: "circle",
        width: 10
    })
);

console.log(
    discriminatedEngine.validate({
        kind: "hexagon",
        sides: 6
    })
);

console.log(
    discriminatedEngine.match(
        {
            kind: "rectangle",
            width: 5,
            height: 3
        },
        {
            circle: (shape) =>
                Math.PI * shape.radius ** 2,

            rectangle: (shape) =>
                shape.width * shape.height,

            triangle: (shape) =>
                0.5 * shape.base * shape.height
        }
    )
);

console.log(
    discriminatedEngine.exhaustive({
        circle: () => { },
        rectangle: () => { }
    })
);

console.log(discriminatedEngine.generate());
console.log(discriminatedEngine.getReport());


// --- Invalid Input ---
console.log(createDiscriminatedUnionEngine([]));
console.log(createDiscriminatedUnionEngine("invalid"));