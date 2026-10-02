// 🧩 PROBLEM–03: createHistorySimulator()

// Logic: This function simulates the browser History API. It supports pushState, replaceState, back, forward, arbitrary navigation with go(), history stack management, navigation callbacks, and navigation statistics.


function createHistorySimulator(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    if (
        typeof config.initialURL !== 'string' ||
        config.initialURL.trim() === '' ||
        !Number.isInteger(config.maxHistorySize) ||
        config.maxHistorySize <= 0 ||
        (
            config.onNavigate !== null &&
            typeof config.onNavigate !== 'function'
        )
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE HISTORY STACK ---
    const stack = [
        {
            url: config.initialURL,
            state: null,
            title: ""
        }
    ];

    let currentIndex = 0;

    let totalNavigations = 0;
    let pushCount = 0;
    let replaceCount = 0;
    let goCount = 0;


    // --- STEP 3: NAVIGATION CALLBACK ---
    function notifyNavigation(entry) {

        if (typeof config.onNavigate === 'function') {

            config.onNavigate(
                entry.url,
                entry.state
            );
        }
    }


    // --- STEP 4: PUSH NEW HISTORY ENTRY ---
    function pushState(state, title, url) {

        if (
            typeof title !== 'string' ||
            typeof url !== 'string' ||
            url.trim() === ''
        ) {
            return {
                success: false,
                currentIndex,
                stackSize: stack.length
            };
        }

        // Remove all forward history.
        stack.splice(currentIndex + 1);

        stack.push({
            url,
            state,
            title
        });

        // Keep only the latest maxHistorySize entries.
        if (stack.length > config.maxHistorySize) {
            stack.shift();
        }

        currentIndex = stack.length - 1;

        pushCount++;
        totalNavigations++;

        notifyNavigation(
            stack[currentIndex]
        );

        return {
            success: true,
            currentIndex,
            stackSize: stack.length
        };
    }


    // --- STEP 5: REPLACE CURRENT ENTRY ---
    function replaceState(state, title, url) {

        if (
            typeof title !== 'string' ||
            typeof url !== 'string' ||
            url.trim() === ''
        ) {
            return {
                success: false,
                replacedURL: stack[currentIndex].url,
                newURL: stack[currentIndex].url
            };
        }

        const replacedURL =
            stack[currentIndex].url;

        stack[currentIndex] = {
            url,
            state,
            title
        };

        replaceCount++;
        totalNavigations++;

        notifyNavigation(
            stack[currentIndex]
        );

        return {
            success: true,
            replacedURL,
            newURL: url
        };
    }


    // --- STEP 6: MOVE THROUGH HISTORY ---
    function go(delta) {

        if (
            !Number.isInteger(delta)
        ) {
            return {
                success: false,
                currentURL: stack[currentIndex].url,
                currentState: stack[currentIndex].state
            };
        }

        const newIndex =
            currentIndex + delta;

        // Prevent navigation outside history stack.
        if (
            newIndex < 0 ||
            newIndex >= stack.length
        ) {
            return {
                success: false,
                currentURL: stack[currentIndex].url,
                currentState: stack[currentIndex].state
            };
        }

        currentIndex = newIndex;

        goCount++;
        totalNavigations++;

        notifyNavigation(
            stack[currentIndex]
        );

        return {
            success: true,
            currentURL: stack[currentIndex].url,
            currentState: stack[currentIndex].state
        };
    }


    // --- STEP 7: GO BACK ---
    function back() {
        return go(-1);
    }


    // --- STEP 8: GO FORWARD ---
    function forward() {
        return go(1);
    }


    // --- STEP 9: GET CURRENT STATE ---
    function getCurrentState() {

        const current =
            stack[currentIndex];

        return {
            url: current.url,
            state: current.state,
            title: current.title,
            index: currentIndex
        };
    }


    // --- STEP 10: GET HISTORY STACK ---
    function getStack() {

        return stack.map(
            entry => entry.url
        );
    }


    // --- STEP 11: CHECK BACK AVAILABILITY ---
    function canGoBack() {

        return currentIndex > 0;
    }


    // --- STEP 12: CHECK FORWARD AVAILABILITY ---
    function canGoForward() {

        return currentIndex < stack.length - 1;
    }


    // --- STEP 13: GET HISTORY REPORT ---
    function getReport() {

        return {
            totalNavigations,
            pushCount,
            replaceCount,
            goCount,
            currentIndex,
            stackSize: stack.length
        };
    }


    // --- STEP 14: RETURN HISTORY API ---
    return {
        pushState,
        replaceState,
        go,
        back,
        forward,
        getCurrentState,
        getStack,
        canGoBack,
        canGoForward,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const history = createHistorySimulator({
    initialURL: "https://app.com/",
    maxHistorySize: 50,
    onNavigate: null
});


console.log(
    history.pushState(
        { page: "home" },
        "Home",
        "/home"
    )
);

console.log(
    history.pushState(
        { page: "about" },
        "About",
        "/about"
    )
);

console.log(
    history.pushState(
        { page: "contact" },
        "Contact",
        "/contact"
    )
);

console.log(history.back());

console.log(history.back());

console.log(
    history.pushState(
        { page: "products" },
        "Products",
        "/products"
    )
);

console.log(history.getStack());

console.log(history.canGoBack());

console.log(history.canGoForward());

console.log(history.getReport());



// --- Invalid Input ---

console.log(
    createHistorySimulator({
        initialURL: "/",
        maxHistorySize: 0,
        onNavigate: null
    })
);

console.log(history.go("invalid"));