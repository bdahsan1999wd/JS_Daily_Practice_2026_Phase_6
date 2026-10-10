// PROBLEM–01: Union Type Resolver Engine


function createUnionTypeEngine(unions) {

    // --- STEP 1: VALIDATE MAIN INPUT ---
    if (!Array.isArray(unions) || unions.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH UNION ---
    const validMembers = new Set([
        "string",
        "number",
        "boolean",
        "null",
        "undefined",
        "bigint",
        "symbol",
        "object",
        "function"
    ]);

    for (const union of unions) {
        if (
            !union ||
            typeof union !== "object" ||
            typeof union.name !== "string" ||
            union.name.trim() === "" ||
            !Array.isArray(union.members) ||
            union.members.length === 0 ||
            !(
                typeof union.discriminant === "string" ||
                union.discriminant === null
            )
        ) {
            return "Invalid Input";
        }

        if (
            union.members.some(
                (member) =>
                    typeof member !== "string" ||
                    member.trim() === ""
            )
        ) {
            return "Invalid Input";
        }

        // Disallow duplicate member types.
        if (new Set(union.members).size !== union.members.length) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: CREATE INTERNAL UNION STORE ---
    const unionMap = new Map();

    for (const union of unions) {
        if (unionMap.has(union.name)) {
            return "Invalid Input";
        }

        unionMap.set(union.name, {
            name: union.name,
            members: [...union.members],
            discriminant: union.discriminant
        });
    }

    // --- STEP 4: VALUE → TYPESCRIPT TYPE HELPER ---
    const getRuntimeType = (value) => {
        if (value === null) return "null";
        return typeof value;
    };

    // --- STEP 5: CHECK VALUE AGAINST MEMBER ---
    const matchesMember = (member, value) => {
        const runtimeType = getRuntimeType(value);

        // Primitive built-in members
        if (validMembers.has(member)) {
            return runtimeType === member;
        }

        // Custom object/class members are represented by object values.
        if (
            value !== null &&
            typeof value === "object" &&
            member !== "object"
        ) {
            return (
                value.constructor &&
                value.constructor.name === member
            );
        }

        return runtimeType === member;
    };

    // --- STEP 6: GET UNION ---
    const getUnion = (unionName) => {
        return unionMap.get(unionName) || null;
    };

    // --- STEP 7: RETURN UNION ENGINE API ---
    return {

        // check(unionName, value)
        check(unionName, value) {
            const union = getUnion(unionName);

            if (!union) {
                return {
                    valid: false,
                    matchedMember: null,
                    reason: `Unknown union: ${unionName}`
                };
            }

            const matchedMember = union.members.find((member) =>
                matchesMember(member, value)
            );

            if (matchedMember) {
                return {
                    valid: true,
                    matchedMember,
                    reason: null
                };
            }

            return {
                valid: false,
                matchedMember: null,
                reason: `${getRuntimeType(value)} is not assignable to ${union.members.join(" | ")}`
            };
        },


        // narrow(unionName, value, guard)
        narrow(unionName, value, guard) {
            const union = getUnion(unionName);

            if (
                !union ||
                !guard ||
                typeof guard !== "object" ||
                typeof guard.kind !== "string"
            ) {
                return "Invalid Input";
            }

            // TYPEOF GUARD
            if (
                guard.kind === "typeof" &&
                typeof guard.type === "string"
            ) {
                if (
                    union.members.includes(guard.type) &&
                    matchesMember(guard.type, value)
                ) {
                    return {
                        narrowedType: guard.type,
                        value,
                        guardApplied: `typeof x === '${guard.type}'`
                    };
                }

                return {
                    narrowedType: null,
                    value,
                    guardApplied: `typeof x === '${guard.type}'`
                };
            }

            // LITERAL PROPERTY GUARD
            if (
                guard.kind === "literal" &&
                typeof guard.property === "string"
            ) {
                if (
                    value !== null &&
                    typeof value === "object" &&
                    value[guard.property] === guard.value
                ) {
                    const matchedMember = union.members.find(
                        (member) =>
                            member === guard.value ||
                            member.toLowerCase() ===
                            String(guard.value).toLowerCase()
                    );

                    return {
                        narrowedType: matchedMember || guard.value,
                        value,
                        guardApplied:
                            `x.${guard.property} === '${guard.value}'`
                    };
                }

                return {
                    narrowedType: null,
                    value,
                    guardApplied:
                        `x.${guard.property} === '${guard.value}'`
                };
            }

            // INSTANCEOF GUARD
            if (
                guard.kind === "instanceof" &&
                typeof guard.class === "string"
            ) {
                const passed =
                    value !== null &&
                    typeof value === "object" &&
                    value.constructor &&
                    value.constructor.name === guard.class;

                return {
                    narrowedType: passed ? guard.class : null,
                    value,
                    guardApplied:
                        `x instanceof ${guard.class}`
                };
            }

            return "Invalid Input";
        },

        // resolve(unionName)
        resolve(unionName) {
            const union = getUnion(unionName);

            if (!union) {
                return "Invalid Input";
            }

            return union.members.join(" | ");
        },

        // distribute(unionName, operation)
        distribute(unionName, operation) {
            const union = getUnion(unionName);

            if (
                !union ||
                !["array", "promise"].includes(operation)
            ) {
                return "Invalid Input";
            }

            if (operation === "array") {
                return union.members
                    .map((member) => `${member}[]`)
                    .join(" | ");
            }

            return union.members
                .map((member) => `Promise<${member}>`)
                .join(" | ");
        },

        // intersect(union1, union2)
        intersect(union1, union2) {
            const first = getUnion(union1);
            const second = getUnion(union2);

            if (!first || !second) {
                return "Invalid Input";
            }

            return first.members.filter((member) =>
                second.members.includes(member)
            );
        },

        // getReport()
        getReport() {
            const membersCount = unions.map(
                (union) => union.members.length
            );

            return {
                totalUnions: unions.length,
                discriminated: unions.filter(
                    (union) => union.discriminant !== null
                ).length,
                maxMembers: Math.max(...membersCount),
                minMembers: Math.min(...membersCount)
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const unionEngine = createUnionTypeEngine([
    {
        name: "StringOrNumber",
        members: ["string", "number"],
        discriminant: null
    },
    {
        name: "Nullable",
        members: ["string", "null", "undefined"],
        discriminant: null
    },
    {
        name: "Shape",
        members: ["Circle", "Rectangle", "Triangle"],
        discriminant: "kind"
    }
]);


console.log(unionEngine.check("StringOrNumber", 42));

console.log(unionEngine.check("StringOrNumber", true));

console.log(unionEngine.check("Nullable", null));

console.log(
    unionEngine.narrow(
        "StringOrNumber",
        "hello",
        {
            kind: "typeof",
            type: "string"
        }
    )
);

console.log(unionEngine.resolve("Shape"));

console.log(
    unionEngine.distribute(
        "StringOrNumber",
        "array"
    )
);

console.log(
    unionEngine.intersect(
        "StringOrNumber",
        "Nullable"
    )
);

console.log(unionEngine.getReport());


// --- Invalid Input ---
console.log(createUnionTypeEngine([]));
console.log(createUnionTypeEngine("invalid"));