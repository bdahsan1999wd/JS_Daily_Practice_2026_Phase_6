// PROBLEM–02: createEnumEngine()

// Logic: Simulates TypeScript enum behavior and enum utilities.

function createEnumEngine(enums) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(enums) || enums.length === 0) {
        return "Invalid Input";
    }

    const validKinds = [
        "numeric",
        "string",
        "const",
        "heterogeneous"
    ];

    for (const enumDef of enums) {
        if (
            typeof enumDef !== "object" ||
            enumDef === null ||
            typeof enumDef.name !== "string" ||
            enumDef.name.length === 0 ||
            !validKinds.includes(enumDef.kind) ||
            !Array.isArray(enumDef.members) ||
            enumDef.members.length === 0
        ) {
            return "Invalid Input";
        }

        for (const member of enumDef.members) {
            if (
                typeof member !== "object" ||
                member === null ||
                typeof member.key !== "string" ||
                member.key.length === 0 ||
                !(
                    typeof member.value === "number" ||
                    typeof member.value === "string" ||
                    member.value === null
                )
            ) {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 2: NORMALIZE ENUM VALUES ---
    const enumMap = new Map();

    for (const enumDef of enums) {
        const members = [];
        let nextNumericValue = 0;

        for (const member of enumDef.members) {
            let value = member.value;

            // null means automatic numeric increment.
            if (value === null) {
                value = nextNumericValue;
            }

            if (typeof value === "number") {
                nextNumericValue = value + 1;
            }

            members.push({
                key: member.key,
                value
            });
        }

        enumMap.set(enumDef.name, {
            name: enumDef.name,
            kind: enumDef.kind,
            members
        });
    }

    // --- STEP 3: FIND ENUM ---
    function getEnum(enumName) {
        if (typeof enumName !== "string") {
            return null;
        }

        return enumMap.get(enumName) || null;
    }

    // --- STEP 4: GET VALUE BY KEY ---
    function getValue(enumName, key) {
        const enumDef = getEnum(enumName);

        if (
            !enumDef ||
            typeof key !== "string"
        ) {
            return null;
        }

        const member = enumDef.members.find(
            item => item.key === key
        );

        return member ? member.value : null;
    }

    // --- STEP 5: GET KEY BY VALUE ---
    function getKey(enumName, value) {
        const enumDef = getEnum(enumName);

        if (!enumDef) {
            return null;
        }

        const member = enumDef.members.find(
            item => item.value === value
        );

        return member ? member.key : null;
    }

    // --- STEP 6: VALIDATE ENUM VALUE ---
    function validate(enumName, value) {
        const enumDef = getEnum(enumName);

        if (!enumDef) {
            return "Invalid Input";
        }

        const member = enumDef.members.find(
            item => item.value === value
        );

        return {
            valid: Boolean(member),
            key: member ? member.key : null,
            value,
            kind: enumDef.kind
        };
    }

    // --- STEP 7: GENERATE TYPESCRIPT ENUM ---
    function generate(enumName) {
        const enumDef = getEnum(enumName);

        if (!enumDef) {
            return "Invalid Input";
        }

        const lines = enumDef.members.map(member => {
            if (typeof member.value === "string") {
                return `  ${member.key} = '${member.value}'`;
            }

            // Auto-style numeric enum output.
            return `  ${member.key}`;
        });

        return `enum ${enumDef.name} {\n${lines.join(",\n")}\n}`;
    }

    // --- STEP 8: CONVERT ENUM TO OBJECT ---
    function toObject(enumName) {
        const enumDef = getEnum(enumName);

        if (!enumDef) {
            return "Invalid Input";
        }

        const result = {};

        for (const member of enumDef.members) {
            result[member.key] = member.value;
        }

        return result;
    }

    // --- STEP 9: COMPARE TWO ENUMS ---
    function compare(enum1, enum2) {
        const first = getEnum(enum1);
        const second = getEnum(enum2);

        if (!first || !second) {
            return "Invalid Input";
        }

        const firstMap = new Map(
            first.members.map(member => [
                member.key,
                member.value
            ])
        );

        const secondMap = new Map(
            second.members.map(member => [
                member.key,
                member.value
            ])
        );

        const commonKeys = [];
        const onlyInA = [];
        const onlyInB = [];
        const valueDiffs = {};

        for (const [key, value] of firstMap) {
            if (secondMap.has(key)) {
                commonKeys.push(key);

                if (secondMap.get(key) !== value) {
                    valueDiffs[key] = {
                        enum1: value,
                        enum2: secondMap.get(key)
                    };
                }
            } else {
                onlyInA.push(key);
            }
        }

        for (const key of secondMap.keys()) {
            if (!firstMap.has(key)) {
                onlyInB.push(key);
            }
        }

        return {
            commonKeys,
            onlyInA,
            onlyInB,
            valueDiffs
        };
    }

    // --- STEP 10: EXTEND EXISTING ENUM ---
    function extend(enumName, newMembers) {
        const enumDef = getEnum(enumName);

        if (
            !enumDef ||
            !Array.isArray(newMembers)
        ) {
            return "Invalid Input";
        }

        let nextNumericValue = 0;

        const numericMembers = enumDef.members.filter(
            member => typeof member.value === "number"
        );

        if (numericMembers.length > 0) {
            nextNumericValue =
                numericMembers[numericMembers.length - 1].value + 1;
        }

        for (const member of newMembers) {
            if (
                typeof member !== "object" ||
                member === null ||
                typeof member.key !== "string" ||
                !(
                    typeof member.value === "string" ||
                    typeof member.value === "number" ||
                    member.value === null
                )
            ) {
                return "Invalid Input";
            }

            let value = member.value;

            if (value === null) {
                value = nextNumericValue;
            }

            if (typeof value === "number") {
                nextNumericValue = value + 1;
            }

            enumDef.members.push({
                key: member.key,
                value
            });
        }

        return {
            name: enumDef.name,
            kind: enumDef.kind,
            members: [...enumDef.members]
        };
    }

    // --- STEP 11: GENERATE REPORT ---
    function getReport() {
        const byKind = {
            numeric: 0,
            string: 0,
            const: 0,
            heterogeneous: 0
        };

        let totalMembers = 0;

        for (const enumDef of enumMap.values()) {
            byKind[enumDef.kind]++;
            totalMembers += enumDef.members.length;
        }

        return {
            totalEnums: enumMap.size,
            byKind,
            totalMembers,
            avgMembersPerEnum:
                Number(
                    (totalMembers / enumMap.size).toFixed(2)
                )
        };
    }

    // --- STEP 12: RETURN ENGINE API ---
    return {
        getValue,
        getKey,
        validate,
        generate,
        toObject,
        compare,
        extend,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const enumEngine = createEnumEngine([
    {
        name: "Direction",
        kind: "numeric",
        members: [
            { key: "Up", value: null },
            { key: "Down", value: null },
            { key: "Left", value: null },
            { key: "Right", value: null }
        ]
    },
    {
        name: "Status",
        kind: "string",
        members: [
            { key: "Active", value: "active" },
            { key: "Inactive", value: "inactive" },
            { key: "Pending", value: "pending" }
        ]
    },
    {
        name: "Flags",
        kind: "numeric",
        members: [
            { key: "None", value: 0 },
            { key: "Read", value: 1 },
            { key: "Write", value: 2 },
            { key: "Admin", value: 4 }
        ]
    }
]);



console.log(enumEngine.getValue("Direction", "Up"));

console.log(enumEngine.getValue("Direction", "Right"));

console.log(enumEngine.getKey("Direction", 2));

console.log(enumEngine.validate("Status", "active"));

console.log(enumEngine.validate("Status", "deleted"));

console.log(enumEngine.generate("Status"));

console.log(enumEngine.generate("Direction"));

console.log(enumEngine.toObject("Flags"));

console.log(enumEngine.getReport());