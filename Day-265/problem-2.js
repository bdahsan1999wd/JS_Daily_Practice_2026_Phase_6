// 🧩 PROBLEM–02: ClassList Manager Engine

function createClassListManager(elements) {

    // --- STEP 1: VALIDATE INPUT ---

    if (
        !Array.isArray(elements) ||
        elements.length === 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE ELEMENTS ---

    const elementIds = new Set();

    for (const element of elements) {

        if (
            !element ||
            typeof element !== "object" ||
            Array.isArray(element) ||
            typeof element.id !== "string" ||
            element.id.trim() === "" ||
            typeof element.tag !== "string" ||
            element.tag.trim() === "" ||
            !Array.isArray(element.classes)
        ) {
            return "Invalid Input";
        }

        if (elementIds.has(element.id)) {
            return "Invalid Input";
        }

        elementIds.add(element.id);

        const classSet = new Set();

        for (const className of element.classes) {

            if (
                typeof className !== "string" ||
                className.trim() === ""
            ) {
                return "Invalid Input";
            }

            if (classSet.has(className)) {
                return "Invalid Input";
            }

            classSet.add(className);
        }
    }

    // --- STEP 3: CREATE ELEMENT MAP ---

    const elementMap = new Map();

    for (const element of elements) {

        elementMap.set(element.id, {
            id: element.id,
            tag: element.tag,
            classes: [...element.classes]
        });
    }

    // --- STEP 4: VALIDATE CLASS NAME ---

    function isValidClassName(className) {

        return (
            typeof className === "string" &&
            className.trim() !== "" &&
            !/\s/.test(className)
        );
    }

    // --- STEP 5: ADD CLASSES ---

    function add(id, ...classNames) {

        if (
            typeof id !== "string" ||
            id.trim() === "" ||
            classNames.length === 0 ||
            !classNames.every(isValidClassName)
        ) {
            return "Invalid Input";
        }

        const element = elementMap.get(id);

        if (!element) {
            return "Element Not Found";
        }

        for (const className of classNames) {

            if (!element.classes.includes(className)) {
                element.classes.push(className);
            }
        }

        return [...element.classes];
    }

    // --- STEP 6: REMOVE CLASSES ---

    function remove(id, ...classNames) {

        if (
            typeof id !== "string" ||
            id.trim() === "" ||
            classNames.length === 0 ||
            !classNames.every(isValidClassName)
        ) {
            return "Invalid Input";
        }

        const element = elementMap.get(id);

        if (!element) {
            return "Element Not Found";
        }

        element.classes = element.classes.filter(
            className => !classNames.includes(className)
        );

        return [...element.classes];
    }

    // --- STEP 7: TOGGLE CLASS ---

    function toggle(id, className) {

        if (
            typeof id !== "string" ||
            id.trim() === "" ||
            !isValidClassName(className)
        ) {
            return "Invalid Input";
        }

        const element = elementMap.get(id);

        if (!element) {
            return "Element Not Found";
        }

        const index =
            element.classes.indexOf(className);

        if (index === -1) {

            element.classes.push(className);

            return true;
        }

        element.classes.splice(index, 1);

        return false;
    }

    // --- STEP 8: CONTAINS ---

    function contains(id, className) {

        if (
            typeof id !== "string" ||
            id.trim() === "" ||
            !isValidClassName(className)
        ) {
            return "Invalid Input";
        }

        const element = elementMap.get(id);

        if (!element) {
            return false;
        }

        return element.classes.includes(className);
    }

    // --- STEP 9: REPLACE CLASS ---

    function replace(id, oldClass, newClass) {

        if (
            typeof id !== "string" ||
            id.trim() === "" ||
            !isValidClassName(oldClass) ||
            !isValidClassName(newClass)
        ) {
            return "Invalid Input";
        }

        const element = elementMap.get(id);

        if (!element) {
            return false;
        }

        const index =
            element.classes.indexOf(oldClass);

        if (index === -1) {
            return false;
        }

        if (
            oldClass !== newClass &&
            element.classes.includes(newClass)
        ) {
            element.classes.splice(index, 1);
            return true;
        }

        element.classes[index] = newClass;

        return true;
    }

    // --- STEP 10: GET CLASSES ---

    function getClasses(id) {

        if (
            typeof id !== "string" ||
            id.trim() === ""
        ) {
            return "Invalid Input";
        }

        const element = elementMap.get(id);

        if (!element) {
            return [];
        }

        return [...element.classes];
    }

    // --- STEP 11: GET ELEMENTS BY CLASS ---

    function getElements(className) {

        if (!isValidClassName(className)) {
            return "Invalid Input";
        }

        const result = [];

        for (const element of elementMap.values()) {

            if (element.classes.includes(className)) {
                result.push(element.id);
            }
        }

        return result;
    }

    // --- STEP 12: GET REPORT ---

    function getReport() {

        const classDistribution = {};

        for (const element of elementMap.values()) {

            for (const className of element.classes) {

                classDistribution[className] =
                    (classDistribution[className] || 0) + 1;
            }
        }

        return {
            totalElements: elementMap.size,
            classDistribution
        };
    }

    // --- STEP 13: RETURN API ---

    return {
        add,
        remove,
        toggle,
        contains,
        replace,
        getClasses,
        getElements,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const manager = createClassListManager([
    {
        id: "btn1",
        tag: "button",
        classes: ["btn", "primary"]
    },
    {
        id: "btn2",
        tag: "button",
        classes: ["btn", "secondary"]
    },
    {
        id: "card1",
        tag: "div",
        classes: ["card", "primary"]
    }
]);


console.log(
    manager.add(
        "btn1",
        "active",
        "large"
    )
);

console.log(
    manager.remove(
        "btn1",
        "large"
    )
);

console.log(
    manager.toggle(
        "btn2",
        "active"
    )
);

console.log(
    manager.toggle(
        "btn2",
        "active"
    )
);

console.log(
    manager.replace(
        "card1",
        "primary",
        "featured"
    )
);

console.log(manager.getClasses("card1"));

console.log(manager.getElements("btn"));

console.log(manager.getReport());


// --- Invalid Input ---
console.log(createClassListManager("invalid"));