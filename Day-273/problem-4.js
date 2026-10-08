// PROBLEM–04: createDeclarationMerger()

// Logic: This function creates a TypeScript declaration-merging engine. It combines multiple interface declarations, stores function overloads, supports interface + namespace augmentation, detects conflicting property types, generates merged TypeScript declarations, and creates reports.

function createDeclarationMerger(declarations) {

    // --- STEP 1: VALIDATE MAIN INPUT ---
    if (!Array.isArray(declarations) || declarations.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE DECLARATIONS ---
    for (const declaration of declarations) {

        if (
            !declaration ||
            typeof declaration !== "object" ||
            !["interface", "namespace", "function"]
                .includes(declaration.type) ||
            typeof declaration.name !== "string" ||
            !declaration.properties ||
            typeof declaration.properties !== "object" ||
            !declaration.members ||
            typeof declaration.members !== "object" ||
            !Array.isArray(declaration.overloads)
        ) {
            return "Invalid Input";
        }

        // Validate property types.
        for (const type of Object.values(declaration.properties)) {

            if (typeof type !== "string") {
                return "Invalid Input";
            }
        }

        // Validate namespace members.
        for (const type of Object.values(declaration.members)) {

            if (typeof type !== "string") {
                return "Invalid Input";
            }
        }


        // Validate function overloads.
        for (const overload of declaration.overloads) {

            if (
                !overload ||
                typeof overload !== "object" ||
                !Array.isArray(overload.params) ||
                typeof overload.returnType !== "string"
            ) {
                return "Invalid Input";
            }


            for (const param of overload.params) {

                if (
                    !param ||
                    typeof param.name !== "string" ||
                    typeof param.type !== "string"
                ) {
                    return "Invalid Input";
                }
            }
        }
    }


    // --- STEP 3: CREATE GROUPED DECLARATION MAP ---
    const declarationMap = new Map();


    for (const declaration of declarations) {

        if (!declarationMap.has(declaration.name)) {
            declarationMap.set(
                declaration.name,
                []
            );
        }

        declarationMap
            .get(declaration.name)
            .push(declaration);
    }


    // --- STEP 4: CREATE MERGE METHOD ---
    const merge = name => {

        if (!declarationMap.has(name)) {
            return "Invalid Input";
        }


        const group =
            declarationMap.get(name);


        let type = null;

        const mergedProperties = {};
        const overloads = [];
        const errors = [];


        // Process every declaration with same name.
        for (const declaration of group) {

            if (type === null) {
                type = declaration.type;
            }


            // Interface declarations merge properties.
            if (declaration.type === "interface") {

                for (
                    const [property, propertyType]
                    of Object.entries(declaration.properties)
                ) {

                    if (
                        Object.prototype.hasOwnProperty.call(
                            mergedProperties,
                            property
                        )
                    ) {

                        if (
                            mergedProperties[property] !==
                            propertyType
                        ) {

                            errors.push({
                                property,
                                types: [
                                    mergedProperties[property],
                                    propertyType
                                ]
                            });
                        }

                    } else {

                        mergedProperties[property] =
                            propertyType;
                    }
                }
            }


            // Function declarations become overloads.
            if (declaration.type === "function") {

                overloads.push(
                    ...declaration.overloads
                );
            }


            // Namespace members act as static additions.
            if (declaration.type === "namespace") {

                Object.assign(
                    mergedProperties,
                    declaration.members
                );
            }
        }


        return {
            type,
            mergedProperties,
            overloads,
            errors
        };
    };


    // --- STEP 5: CREATE AUGMENT METHOD ---
    const augment = (interfaceName, additions) => {

        if (
            typeof interfaceName !== "string" ||
            !additions ||
            typeof additions !== "object" ||
            Array.isArray(additions)
        ) {
            return "Invalid Input";
        }


        const group =
            declarationMap.get(interfaceName);


        if (!group) {
            return "Invalid Input";
        }


        const interfaceDeclaration =
            group.find(
                item => item.type === "interface"
            );


        if (!interfaceDeclaration) {
            return "Invalid Input";
        }


        for (const [property, propertyType] of Object.entries(additions)) {

            if (typeof propertyType !== "string") {
                return "Invalid Input";
            }

            interfaceDeclaration.properties[property] =
                propertyType;
        }


        return merge(interfaceName);
    };


    // --- STEP 6: CREATE GET OVERLOADS METHOD ---
    const getOverloads = fnName => {

        if (!declarationMap.has(fnName)) {
            return [];
        }


        const group =
            declarationMap.get(fnName);


        return group
            .filter(
                declaration =>
                    declaration.type === "function"
            )
            .flatMap(
                declaration =>
                    declaration.overloads
            );
    };


    // --- STEP 7: CREATE GENERATE METHOD ---
    const generate = name => {

        const merged = merge(name);

        if (merged === "Invalid Input") {
            return "Invalid Input";
        }


        const lines = [];


        // Generate interface declaration.
        if (merged.type === "interface") {

            lines.push(`interface ${name} {`);


            for (
                const [property, propertyType]
                of Object.entries(merged.mergedProperties)
            ) {

                lines.push(
                    `  ${property}: ${propertyType};`
                );
            }


            lines.push("}");
        }


        // Generate function overloads.
        else if (merged.type === "function") {

            for (const overload of merged.overloads) {

                const params = overload.params
                    .map(
                        param =>
                            `${param.name}: ${param.type}`
                    )
                    .join(", ");


                lines.push(
                    `function ${name}(${params}): ${overload.returnType};`
                );
            }
        }


        // Generate namespace declaration.
        else if (merged.type === "namespace") {

            lines.push(`namespace ${name} {`);


            for (
                const [member, memberType]
                of Object.entries(merged.mergedProperties)
            ) {

                lines.push(
                    `  const ${member}: ${memberType};`
                );
            }


            lines.push("}");
        }


        return lines.join("\n");
    };


    // --- STEP 8: CREATE CONFLICT DETECTION METHOD ---
    const detectConflicts = () => {

        const conflicts = [];


        for (const [name, group] of declarationMap.entries()) {

            const interfaceDeclarations =
                group.filter(
                    item => item.type === "interface"
                );


            const propertyTypes = new Map();


            for (const declaration of interfaceDeclarations) {

                for (
                    const [property, propertyType]
                    of Object.entries(declaration.properties)
                ) {

                    if (!propertyTypes.has(property)) {

                        propertyTypes.set(
                            property,
                            new Set([propertyType])
                        );

                    } else {

                        propertyTypes
                            .get(property)
                            .add(propertyType);
                    }
                }
            }


            for (
                const [property, typesSet]
                of propertyTypes.entries()
            ) {

                if (typesSet.size > 1) {

                    conflicts.push({
                        name,
                        property,
                        types: [...typesSet]
                    });
                }
            }
        }


        return conflicts;
    };


    // --- STEP 9: CREATE REPORT METHOD ---
    const getReport = () => {

        let mergedCount = 0;
        let augmentations = 0;


        for (const group of declarationMap.values()) {

            if (group.length > 1) {
                mergedCount++;
            }


            const hasInterface =
                group.some(
                    item => item.type === "interface"
                );

            const hasNamespace =
                group.some(
                    item => item.type === "namespace"
                );


            if (hasInterface && hasNamespace) {
                augmentations++;
            }
        }


        return {
            totalDeclarations: declarations.length,
            mergedCount,
            conflicts: detectConflicts().length,
            augmentations
        };
    };


    // --- STEP 10: RETURN DECLARATION MERGER API ---
    return {
        merge,
        augment,
        getOverloads,
        generate,
        detectConflicts,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const merger = createDeclarationMerger([
    {
        type: "interface",
        name: "Window",
        properties: {
            title: "string",
            width: "number"
        },
        members: {},
        overloads: []
    },

    {
        type: "interface",
        name: "Window",
        properties: {
            height: "number",
            scrollY: "number"
        },
        members: {},
        overloads: []
    },

    {
        type: "function",
        name: "process",
        properties: {},
        members: {},
        overloads: [
            {
                params: [
                    {
                        name: "x",
                        type: "string"
                    }
                ],
                returnType: "string"
            },

            {
                params: [
                    {
                        name: "x",
                        type: "number"
                    }
                ],
                returnType: "number"
            }
        ]
    }
]);


console.log(merger.merge("Window"));

console.log(merger.getOverloads("process"));

console.log(merger.generate("Window"));

console.log(merger.detectConflicts());

console.log(merger.getReport());


// --- Invalid Input ---
console.log(createDeclarationMerger("invalid"));