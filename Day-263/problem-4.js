// 🧩 PROBLEM–04: buildStrategySystem()

// Logic: This function builds a Strategy Pattern system where a Sorter context can switch between different sorting strategies at runtime.


// --- STEP 1: VALIDATE CONFIG ---

function buildStrategySystem(config) {

    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        config.systemName.trim() === '' ||
        typeof config.defaultStrategy !== 'string' ||
        config.defaultStrategy.trim() === ''
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE STRATEGY STATE ---

    const strategies = new Map();

    const strategyStats = new Map();

    // --- STEP 3: DEFINE SORT ALGORITHMS ---

    function bubbleSort(data) {

        const result = [...data];

        for (let i = 0; i < result.length - 1; i++) {

            for (let j = 0; j < result.length - 1 - i; j++) {

                if (result[j] > result[j + 1]) {

                    [result[j], result[j + 1]] =
                        [result[j + 1], result[j]];
                }
            }
        }

        return result;
    }

    function quickSort(data) {

        if (data.length <= 1) {
            return [...data];
        }

        const pivot = data[data.length - 1];

        const left = [];
        const right = [];

        for (let i = 0; i < data.length - 1; i++) {

            if (data[i] < pivot) {
                left.push(data[i]);
            } else {
                right.push(data[i]);
            }
        }

        return [
            ...quickSort(left),
            pivot,
            ...quickSort(right)
        ];
    }

    function mergeSort(data) {

        if (data.length <= 1) {
            return [...data];
        }

        const middle = Math.floor(data.length / 2);

        const left = mergeSort(
            data.slice(0, middle)
        );

        const right = mergeSort(
            data.slice(middle)
        );

        const result = [];

        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {

            if (left[i] <= right[j]) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        return [
            ...result,
            ...left.slice(i),
            ...right.slice(j)
        ];
    }

    function insertionSort(data) {

        const result = [...data];

        for (let i = 1; i < result.length; i++) {

            const current = result[i];

            let j = i - 1;

            while (
                j >= 0 &&
                result[j] > current
            ) {
                result[j + 1] = result[j];
                j--;
            }

            result[j + 1] = current;
        }

        return result;
    }

    // --- STEP 4: DEFINE BUILT-IN STRATEGIES ---

    strategies.set("BubbleSort", {
        sort: bubbleSort,
        complexity: "O(n²)",
        stable: true,
        time: n => n * n
    });

    strategies.set("QuickSort", {
        sort: quickSort,
        complexity: "O(n log n)",
        stable: false,
        time: n => n * Math.log2(n || 1)
    });

    strategies.set("MergeSort", {
        sort: mergeSort,
        complexity: "O(n log n)",
        stable: true,
        time: n => n * Math.log2(n || 1)
    });

    strategies.set("InsertionSort", {
        sort: insertionSort,
        complexity: "O(n²)",
        stable: true,
        time: n => n * n
    });

    // --- STEP 5: INITIALIZE STRATEGY STATISTICS ---

    for (const strategyName of strategies.keys()) {

        strategyStats.set(strategyName, {
            executionCount: 0,
            lastExecutionTime: 0
        });
    }

    // --- STEP 6: DEFINE SORTER CONTEXT CLASS ---

    class Sorter {

        #name;
        #currentStrategy;

        constructor(name) {
            this.#name = name;
            this.#currentStrategy = config.defaultStrategy;
        }

        setStrategy(strategyName) {

            if (
                typeof strategyName !== 'string' ||
                strategyName.trim() === ''
            ) {
                return "Invalid Input";
            }

            if (!strategies.has(strategyName)) {
                return "Strategy Not Found";
            }

            this.#currentStrategy = strategyName;

            return strategyName;
        }

        sort(data) {

            if (
                !Array.isArray(data) ||
                data.some(
                    value =>
                        typeof value !== 'number' ||
                        !Number.isFinite(value)
                )
            ) {
                return "Invalid Input";
            }

            const strategy =
                strategies.get(this.#currentStrategy);

            const result = strategy.sort(data);

            const simulatedTime =
                strategy.time(data.length);

            const stats =
                strategyStats.get(this.#currentStrategy);

            stats.executionCount++;
            stats.lastExecutionTime = simulatedTime;

            return result;
        }

        getCurrentStrategy() {
            return this.#currentStrategy;
        }

        getName() {
            return this.#name;
        }
    }

    // --- STEP 7: VALIDATE DEFAULT STRATEGY ---

    if (!strategies.has(config.defaultStrategy)) {
        return "Invalid Input";
    }

    // --- STEP 8: INITIALIZE SYSTEM STATE ---

    const sorters = new Map();

    // --- STEP 9: DEFINE CREATESORTER ---

    function createSorter(name) {

        if (
            typeof name !== 'string' ||
            name.trim() === ''
        ) {
            return "Invalid Input";
        }

        if (sorters.has(name)) {
            return "Sorter Exists";
        }

        const sorter = new Sorter(name);

        sorters.set(name, sorter);

        return sorter;
    }

    // --- STEP 10: DEFINE GETSORTER ---

    function getSorter(name) {

        if (
            typeof name !== 'string' ||
            name.trim() === ''
        ) {
            return "Invalid Input";
        }

        return sorters.get(name);
    }

    // --- STEP 11: DEFINE REGISTERSTRATEGY ---

    function registerStrategy(name, strategyFn) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof strategyFn !== 'function'
        ) {
            return "Invalid Input";
        }

        if (strategies.has(name)) {
            return "Strategy Exists";
        }

        strategies.set(name, {
            sort: data => strategyFn([...data]),
            complexity: "Custom",
            stable: false,
            time: n => n
        });

        strategyStats.set(name, {
            executionCount: 0,
            lastExecutionTime: 0
        });

        return true;
    }

    // --- STEP 12: DEFINE BENCHMARK ---

    function benchmark(data, strategyNames) {

        if (
            !Array.isArray(data) ||
            data.some(
                value =>
                    typeof value !== 'number' ||
                    !Number.isFinite(value)
            ) ||
            !Array.isArray(strategyNames) ||
            strategyNames.length === 0
        ) {
            return "Invalid Input";
        }

        for (const strategyName of strategyNames) {

            if (
                typeof strategyName !== 'string' ||
                strategyName.trim() === '' ||
                !strategies.has(strategyName)
            ) {
                return "Invalid Input";
            }
        }

        const results = [];

        for (const strategyName of strategyNames) {

            const strategy = strategies.get(strategyName);

            const result = strategy.sort(data);

            const simulatedTime =
                strategy.time(data.length);

            results.push({
                strategy: strategyName,
                result,
                simulatedTime
            });
        }

        return results;
    }

    // --- STEP 13: DEFINE GETREPORT ---

    function getReport() {

        const strategyUsage = {};

        for (const [name, stats] of strategyStats) {

            if (stats.executionCount > 0) {
                strategyUsage[name] = stats.executionCount;
            }
        }

        let fastestStrategy = null;
        let fastestTime = Infinity;

        for (const [name, stats] of strategyStats) {

            if (
                stats.executionCount > 0 &&
                stats.lastExecutionTime < fastestTime
            ) {
                fastestTime = stats.lastExecutionTime;
                fastestStrategy = name;
            }
        }

        return {
            totalSorters: sorters.size,
            strategyUsage,
            fastestStrategy
        };
    }

    // --- STEP 14: RETURN API ---

    return {
        createSorter,
        getSorter,
        registerStrategy,
        benchmark,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const system = buildStrategySystem({
    systemName: "SortEngine",
    defaultStrategy: "MergeSort"
});

system.createSorter("dataSorter");

const sorter = system.getSorter("dataSorter");

sorter.setStrategy("BubbleSort");


console.log(sorter.sort([5, 3, 8, 1, 9, 2]));

sorter.setStrategy("QuickSort");

console.log(sorter.sort([5, 3, 8, 1, 9, 2]));

console.log(sorter.getCurrentStrategy());

console.log(
    system.benchmark(
        [5, 3, 8, 1, 9, 2],
        [
            "BubbleSort",
            "QuickSort",
            "MergeSort"
        ]
    )
);

console.log(system.getReport());


// --- Invalid Input ---
console.log(buildStrategySystem("invalid"));