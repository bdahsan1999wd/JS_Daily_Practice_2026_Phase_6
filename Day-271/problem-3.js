// 🧩 PROBLEM–03: createUIComponentEngine()

// Logic: This function simulates a reusable UI component system.

// It combines:
// 1. Component factory
// 2. Component state
// 3. Mount/unmount lifecycle
// 4. Event delegation
// 5. Theme management
// 6. Animation simulation
// 7. UI preference persistence


function createUIComponentEngine(config) {
    // --- STEP 1: VALIDATE CONFIG ---

    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        namespace,
        theme,
        animationDuration,
        storageKey
    } = config;

    if (
        typeof namespace !== "string" ||
        namespace.trim() === ""
    ) {
        return "Invalid Input";
    }

    if (
        theme !== "light" &&
        theme !== "dark"
    ) {
        return "Invalid Input";
    }

    if (
        typeof animationDuration !== "number" ||
        !Number.isFinite(animationDuration) ||
        animationDuration < 0
    ) {
        return "Invalid Input";
    }

    if (
        typeof storageKey !== "string" ||
        storageKey.trim() === ""
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL STATE ---

    const allowedTypes = [
        "button",
        "modal",
        "dropdown",
        "toast",
        "accordion"
    ];

    const components = new Map();

    const eventRegistry = new Map();

    const storage = new Map();

    let currentTheme = theme;

    let componentCounters = {};

    // --- STEP 3: COMPONENT FACTORY ---

    function createComponent(type, props = {}) {
        if (!allowedTypes.includes(type)) {
            return "Invalid Input";
        }

        if (
            typeof props !== "object" ||
            props === null ||
            Array.isArray(props)
        ) {
            return "Invalid Input";
        }

        componentCounters[type] =
            (componentCounters[type] || 0) + 1;

        const id =
            `${namespace}-${type}-${componentCounters[type]}`;

        // Define default states.
        let defaultState = "idle";

        if (type === "modal") {
            defaultState = "closed";
        }

        if (type === "dropdown") {
            defaultState = "closed";
        }

        if (type === "accordion") {
            defaultState = "collapsed";
        }

        if (type === "toast") {
            defaultState = "hidden";
        }

        const component = {
            id,
            type,
            props: { ...props },
            state: defaultState,
            mounted: false,
            animating: false
        };

        components.set(id, component);

        return {
            id: component.id,
            type: component.type,
            props: { ...component.props },
            state: component.state
        };
    }

    // --- STEP 4: MOUNT COMPONENT ---

    function mount(componentId) {
        const component = components.get(componentId);

        if (!component) {
            return "Invalid Input";
        }

        component.mounted = true;

        // Keep the component's logical state.
        if (component.type === "button") {
            component.state = "mounted";
        }

        triggerEvent(componentId, "mount", {
            componentId
        });

        return {
            id: componentId,
            state: component.state,
            event: "mount"
        };
    }

    // --- STEP 5: UNMOUNT COMPONENT ---

    function unmount(componentId) {
        const component = components.get(componentId);

        if (!component) {
            return "Invalid Input";
        }

        component.mounted = false;

        triggerEvent(componentId, "unmount", {
            componentId
        });

        return {
            id: componentId,
            state: "unmounted",
            event: "unmount"
        };
    }

    // --- STEP 6: EVENT DELEGATION ---

    function on(componentId, event, fn) {
        if (
            typeof componentId !== "string" ||
            typeof event !== "string" ||
            event.trim() === "" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        if (!components.has(componentId)) {
            return "Invalid Input";
        }

        if (!eventRegistry.has(componentId)) {
            eventRegistry.set(componentId, new Map());
        }

        const componentEvents = eventRegistry.get(componentId);

        if (!componentEvents.has(event)) {
            componentEvents.set(event, []);
        }

        componentEvents.get(event).push(fn);

        return {
            registered: true,
            componentId,
            event
        };
    }

    function triggerEvent(componentId, event, data) {
        const componentEvents = eventRegistry.get(componentId);

        if (!componentEvents) {
            return [];
        }

        const listeners = componentEvents.get(event) || [];

        return listeners.map(fn => {
            try {
                return fn(data);
            } catch (error) {
                return null;
            }
        });
    }

    // --- STEP 7: THEME TOGGLE ---

    function toggleTheme() {
        currentTheme =
            currentTheme === "light"
                ? "dark"
                : "light";

        // Persist UI preference.
        storage.set(
            storageKey,
            {
                theme: currentTheme
            }
        );

        // Animation simulation.
        for (const component of components.values()) {
            if (component.mounted) {
                component.animating = true;
            }
        }

        return {
            theme: currentTheme,
            persisted: true,
            animating: true
        };
    }

    // --- STEP 8: COMPONENT LOOKUP ---

    function getComponent(componentId) {
        const component = components.get(componentId);

        if (!component) {
            return "Invalid Input";
        }

        return {
            id: component.id,
            type: component.type,
            props: { ...component.props },
            state: component.state,
            mounted: component.mounted,
            animating: component.animating
        };
    }

    // --- STEP 9: REPORT ---

    function getReport() {
        let mounted = 0;
        let unmounted = 0;

        for (const component of components.values()) {
            if (component.mounted) {
                mounted++;
            } else {
                unmounted++;
            }
        }

        return {
            totalComponents: components.size,
            mounted,
            unmounted,
            theme: currentTheme,
            storageKeys: [...storage.keys()]
        };
    }

    // --- STEP 10: RETURN UI API ---

    return {
        createComponent,
        mount,
        unmount,
        toggleTheme,
        on,
        getComponent,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const ui = createUIComponentEngine({
    namespace: "app",
    theme: "light",
    animationDuration: 300,
    storageKey: "ui-prefs"
});


console.log(
    ui.createComponent(
        "button",
        {
            label: "Submit",
            variant: "primary",
            disabled: false
        }
    )
);

console.log(
    ui.createComponent(
        "modal",
        {
            title: "Confirm",
            content: "Are you sure?",
            closable: true
        }
    )
);

console.log(ui.mount("app-button-1"));

console.log(
    ui.on(
        "app-button-1",
        "click",
        () => "Button clicked!"
    )
);

console.log(ui.toggleTheme());
console.log(ui.getReport());
console.log(ui.getComponent("app-button-1"));


// --- Invalid Input ---
console.log(ui.createComponent("unknown", {}));
console.log(ui.mount("unknown-component"));