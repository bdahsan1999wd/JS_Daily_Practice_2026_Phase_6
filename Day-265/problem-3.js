// 🧩 PROBLEM–03: Dynamic Element Factory Engine

function createElementFactory(config) {

    // --- STEP 1: VALIDATE CONFIG ---

    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.namespace !== "string" ||
        config.namespace.trim() === "" ||
        !config.defaultStyles ||
        typeof config.defaultStyles !== "object" ||
        Array.isArray(config.defaultStyles) ||
        !Array.isArray(config.allowedTags) ||
        config.allowedTags.length === 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE ALLOWED TAGS ---

    if (
        !config.allowedTags.every(
            tag =>
                typeof tag === "string" &&
                tag.trim() !== ""
        )
    ) {
        return "Invalid Input";
    }

    const allowedTags = new Set(
        config.allowedTags.map(
            tag => tag.toLowerCase()
        )
    );

    // --- STEP 3: INITIALIZE STATE ---

    const createdElements = new Map();

    const byTag = {};

    let idCounter = 0;

    let lastCreated = null;

    // --- STEP 4: VALIDATE OBJECT ---

    function isObject(value) {

        return (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    // --- STEP 5: CREATE ELEMENT ---

    function createElement(tag, options = {}) {

        if (
            typeof tag !== "string" ||
            tag.trim() === "" ||
            !isObject(options)
        ) {
            return "Invalid Input";
        }

        tag = tag.toLowerCase();

        if (!allowedTags.has(tag)) {
            return "Tag Not Allowed";
        }

        // Validate classes
        if (
            options.classes !== undefined &&
            (
                !Array.isArray(options.classes) ||
                !options.classes.every(
                    className =>
                        typeof className === "string" &&
                        className.trim() !== ""
                )
            )
        ) {
            return "Invalid Input";
        }

        // Validate attributes
        if (
            options.attributes !== undefined &&
            !isObject(options.attributes)
        ) {
            return "Invalid Input";
        }

        // Validate children
        if (
            options.children !== undefined &&
            !Array.isArray(options.children)
        ) {
            return "Invalid Input";
        }

        // Validate styles
        if (
            options.styles !== undefined &&
            !isObject(options.styles)
        ) {
            return "Invalid Input";
        }

        // Validate text
        if (
            options.text !== undefined &&
            typeof options.text !== "string"
        ) {
            return "Invalid Input";
        }

        // Generate ID
        idCounter++;

        const id =
            options.id !== undefined
                ? options.id
                : `${config.namespace}-${tag}-${idCounter}`;

        if (
            typeof id !== "string" ||
            id.trim() === ""
        ) {
            return "Invalid Input";
        }

        if (createdElements.has(id)) {
            return "ID Already Exists";
        }

        // Merge default styles with custom styles
        const styles = {
            ...config.defaultStyles,
            ...(options.styles || {})
        };

        const element = {
            id,
            tag,
            classes: [
                ...(options.classes || [])
            ],
            text:
                options.text !== undefined
                    ? options.text
                    : null,
            styles,
            attributes: {
                ...(options.attributes || {})
            },
            children: [
                ...(options.children || [])
            ]
        };

        // Store element
        createdElements.set(id, element);

        byTag[tag] =
            (byTag[tag] || 0) + 1;

        lastCreated = id;

        return element;
    }

    // --- STEP 6: CREATE LIST ---

    function createList(items, tag = "ul") {

        if (
            !Array.isArray(items) ||
            items.length === 0 ||
            !["ul", "ol"].includes(tag)
        ) {
            return "Invalid Input";
        }

        if (
            !items.every(
                item => typeof item === "string"
            )
        ) {
            return "Invalid Input";
        }

        if (
            !allowedTags.has(tag) ||
            !allowedTags.has("li")
        ) {
            return "Tag Not Allowed";
        }

        const children = [];

        // Create the list first
        const list = createElement(tag, {
            children
        });

        if (
            typeof list === "string"
        ) {
            return list;
        }

        for (const item of items) {

            const child = createElement("li", {
                text: item
            });

            if (typeof child === "string") {
                return child;
            }

            children.push(child);
        }

        return list;
    }

    // --- STEP 7: CREATE TABLE ---

    function createTable(headers, rows) {

        if (
            !Array.isArray(headers) ||
            headers.length === 0 ||
            !Array.isArray(rows) ||
            !rows.every(Array.isArray)
        ) {
            return "Invalid Input";
        }

        if (
            !headers.every(
                header => typeof header === "string"
            )
        ) {
            return "Invalid Input";
        }

        if (
            !rows.every(
                row =>
                    row.length === headers.length &&
                    row.every(
                        cell => typeof cell === "string"
                    )
            )
        ) {
            return "Invalid Input";
        }

        // Required tags
        const requiredTags = [
            "table",
            "tr",
            "th",
            "td"
        ];

        if (
            !requiredTags.every(
                tag => allowedTags.has(tag)
            )
        ) {
            return "Tag Not Allowed";
        }

        const tableChildren = [];

        const table = createElement(
            "table",
            {
                children: tableChildren
            }
        );

        if (typeof table === "string") {
            return table;
        }

        const headerRowChildren = [];

        const headerRow = createElement(
            "tr",
            {
                children: headerRowChildren
            }
        );

        for (const header of headers) {

            headerRowChildren.push(
                createElement("th", {
                    text: header
                })
            );
        }

        tableChildren.push(headerRow);

        for (const row of rows) {

            const rowChildren = [];

            const rowElement = createElement(
                "tr",
                {
                    children: rowChildren
                }
            );

            for (const cell of row) {

                rowChildren.push(
                    createElement("td", {
                        text: cell
                    })
                );
            }

            tableChildren.push(rowElement);
        }

        return table;
    }

    // --- STEP 8: CREATE FORM ---

    function createForm(fields) {

        if (
            !Array.isArray(fields) ||
            fields.length === 0
        ) {
            return "Invalid Input";
        }

        if (
            !fields.every(field => {

                return (
                    isObject(field) &&
                    typeof field.name === "string" &&
                    field.name.trim() !== "" &&
                    typeof field.type === "string" &&
                    field.type.trim() !== "" &&
                    typeof field.label === "string" &&
                    typeof field.required === "boolean" &&
                    typeof field.placeholder === "string"
                );
            })
        ) {
            return "Invalid Input";
        }

        if (
            !allowedTags.has("form") ||
            !allowedTags.has("input")
        ) {
            return "Tag Not Allowed";
        }

        const children = [];

        const form = createElement(
            "form",
            {
                children
            }
        );

        for (const field of fields) {

            const input = createElement(
                "input",
                {
                    attributes: {
                        name: field.name,
                        type: field.type,
                        required: field.required,
                        placeholder: field.placeholder
                    }
                }
            );

            children.push({
                label: field.label,
                input
            });
        }

        return form;
    }

    // --- STEP 9: GET ELEMENT BY ID ---

    function getElementById(id) {

        if (
            typeof id !== "string" ||
            id.trim() === ""
        ) {
            return "Invalid Input";
        }

        return createdElements.get(id);
    }

    // --- STEP 10: GET ALL CREATED ELEMENTS ---

    function getCreatedElements() {

        return [...createdElements.values()];
    }

    // --- STEP 11: GET REPORT ---

    function getReport() {

        return {
            totalCreated: createdElements.size,
            byTag: { ...byTag },
            lastCreated
        };
    }

    // --- STEP 12: RETURN API ---

    return {
        createElement,
        createList,
        createTable,
        createForm,
        getElementById,
        getCreatedElements,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const factory = createElementFactory({

    namespace: "app",

    defaultStyles: {
        fontFamily: "Arial"
    },

    allowedTags: [
        "div",
        "p",
        "ul",
        "li",
        "table",
        "tr",
        "th",
        "td",
        "form",
        "input"
    ]
});

console.log(
    factory.createElement(
        "div",
        {
            classes: ["container"],
            text: "Hello",
            styles: {
                color: "red"
            }
        }
    )
);

console.log(
    factory.createList(
        [
            "Item 1",
            "Item 2",
            "Item 3"
        ],
        "ul"
    )
);

console.log(factory.getReport());


// --- Invalid Input ---
console.log(createElementFactory("invalid"));