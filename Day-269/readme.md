# 🎓 JS DAILY PRACTICE – DAY-269

📅 **Goal:** Browser Timers & Animation Engine
🎯 **Focus:** setTimeout • setInterval • requestAnimationFrame • Debounce • Throttle • Animation Frame Simulation

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: ⏰ Timer Manager Engine

⚠️ **Function Name:** `createTimerManager()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (timer API)      |

**Rules:**

`config` object:

- `maxTimers` (number) — max concurrent timers allowed
- `tickUnit` (string) — `"ms"` | `"s"` (simulation unit label)

**Timer Manager API (returned object):**

- `setTimeout(name, fn, delay)` → registers a one-shot timer
  - Returns `{ timerId, name, delay, type: "timeout" }`
- `setInterval(name, fn, interval)` → registers a repeating timer
  - Returns `{ timerId, name, interval, type: "interval" }`
- `clearTimer(timerId)` → cancels a timer → returns boolean
- `tick(units)` → advances simulation time by `units`
  - Fires all timers that should have executed
  - Returns `{ firedTimers, executionLog }`
- `getActiveTimers()` → returns all currently active timers
- `getPendingCount()` → returns count of pending timers
- `getReport()` → returns `{ totalCreated, totalFired, totalCleared, activeCount }`

| Challenge 📢 | Return timer API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------ |

**Sample Input & Output:**

- `const manager = createTimerManager({ maxTimers: 10, tickUnit: "ms" })`
- `manager.setTimeout("greet", () => "Hello!", 100)`
- `manager.setInterval("tick", () => "tick!", 50)`
- `manager.tick(50)` ➔ `{ firedTimers: ["tick"], executionLog: [{ name: "tick", result: "tick!", firedAt: 50 }] }`
- `manager.tick(50)` ➔ `{ firedTimers: ["greet", "tick"], executionLog: [{ name: "greet", result: "Hello!", firedAt: 100 }, { name: "tick", result: "tick!", firedAt: 100 }] }`
- `manager.getPendingCount()` ➔ `1` *(interval still active)*
- `manager.getReport()` ➔ `{ totalCreated: 2, totalFired: 3, totalCleared: 0, activeCount: 1 }`

---

## 🧩 PROBLEM–02: 🎯 Debounce & Throttle Engine

⚠️ **Function Name:** `createRateControlEngine()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (rate control API) |

**Rules:**

`config` object:

- `tickSize` (number) — simulation tick size in ms

**Rate Control API (returned object):**

- `debounce(name, fn, wait, options)` → creates debounced function
  - `options`: `{ leading: boolean, trailing: boolean, maxWait: number }`
  - `leading: true` → fires on first call immediately
  - `trailing: true` → fires after wait period (default)
  - `maxWait` → fires at most once per maxWait ms regardless
  - Returns debounced function with `.cancel()` and `.flush()` methods
- `throttle(name, fn, limit, options)` → creates throttled function
  - `options`: `{ leading: boolean, trailing: boolean }`
  - Returns throttled function with `.cancel()` methods
- `simulate(fnName, callTimes[])` → simulates calls at given tick times
  - Returns `{ calls, executions, skipped }`
- `getStats(fnName)` → returns `{ totalCalls, totalExecutions, skippedCalls, lastExecuted }`
- `getReport()` → returns `{ totalFunctions, debounced, throttled }`

| Challenge 📢 | Return rate control API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createRateControlEngine({ tickSize: 10 })`
- `engine.debounce("searchInput", (q) => "Searching: " + q, 300, { leading: false, trailing: true })`
- `engine.simulate("searchInput", [0, 100, 200, 250, 600])` ➔
  `{`
  `calls: 5,`
  `executions: [{ at: 550, result: "Searching: call4" }],`
  `skipped: 4`
  `}`
- `engine.throttle("scrollHandler", () => "Scroll!", 200, { leading: true, trailing: false })`
- `engine.simulate("scrollHandler", [0, 50, 100, 200, 250, 400])` ➔
  `{`
  `calls: 6,`
  `executions: [{ at: 0, result: "Scroll!" }, { at: 200, result: "Scroll!" }, { at: 400, result: "Scroll!" }],`
  `skipped: 3`
  `}`
- `engine.getStats("searchInput")` ➔ `{ totalCalls: 5, totalExecutions: 1, skippedCalls: 4, lastExecuted: 550 }`

---

## 🧩 PROBLEM–03: 🎬 Animation Frame Scheduler

⚠️ **Function Name:** `createAnimationScheduler()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (scheduler API)      |

**Rules:**

`config` object:

- `targetFPS` (number) — target frames per second (e.g., `60`)
- `maxFrames` (number) — max frames to simulate
- `autoStop` (boolean) — stops when all animations complete

**Animation Scheduler API (returned object):**

- `requestFrame(name, fn)` → registers animation callback (like `requestAnimationFrame`)
  - `fn(timestamp, deltaTime)` receives current frame time and time since last frame
  - Returns `frameId`
- `cancelFrame(frameId)` → cancels animation frame
- `runFrames(count)` → simulates `count` animation frames
  - Each frame: calculates timestamp, deltaTime, calls all registered callbacks
  - Returns `{ framesRun, executionLog, fps }`
- `schedule(name, fn, durationFrames)` → runs animation for fixed number of frames then auto-cancels
- `getActiveFrames()` → returns names of currently active animation callbacks
- `getFrameStats()` → returns `{ totalFrames, avgDeltaTime, minFPS, maxFPS, droppedFrames }`

| Challenge 📢 | Return scheduler API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const scheduler = createAnimationScheduler({ targetFPS: 60, maxFrames: 1000, autoStop: true })`
- `scheduler.requestFrame("moveBox", (ts, dt) => ({ x: dt * 0.1, timestamp: ts }))`
- `scheduler.schedule("fadeIn", (ts, dt) => ({ opacity: dt * 0.01 }), 3)`
- `scheduler.runFrames(5)` ➔
  `{`
  `framesRun: 5,`
  `executionLog: [`
  `{ frame: 1, timestamp: 16.67, callbacks: ["moveBox", "fadeIn"] },`
  `{ frame: 2, timestamp: 33.33, callbacks: ["moveBox", "fadeIn"] },`
  `{ frame: 3, timestamp: 50, callbacks: ["moveBox", "fadeIn"] },`
  `{ frame: 4, timestamp: 66.67, callbacks: ["moveBox"] },`
  `{ frame: 5, timestamp: 83.33, callbacks: ["moveBox"] }`
  `],`
  `fps: 60`
  `}`
- `scheduler.getActiveFrames()` ➔ `["moveBox"]`
- `scheduler.getFrameStats()` ➔ `{ totalFrames: 5, avgDeltaTime: 16.67, minFPS: 60, maxFPS: 60, droppedFrames: 0 }`

---

## 🧩 PROBLEM–04: ⏱️ Countdown & Stopwatch Engine

⚠️ **Function Name:** `createTimePieceEngine()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (timepiece API)   |

**Rules:**

`config` object:

- `precision` → `"ms"` | `"s"` | `"m"` — output precision
- `maxLaps` (number) — max lap records for stopwatch
- `onComplete` (function or `null`) — callback when countdown reaches 0

**TimePiece Engine API (returned object):**

- **Stopwatch:**
  - `start()` → starts stopwatch from current or paused time
  - `pause()` → pauses stopwatch → returns elapsed time
  - `reset()` → resets to 0
  - `lap()` → records lap time → returns `{ lapNumber, lapTime, totalTime }`
  - `getLaps()` → returns all lap records
  - `getElapsed()` → returns current elapsed time

- **Countdown:**
  - `setCountdown(seconds)` → sets countdown duration
  - `startCountdown()` → begins countdown
  - `pauseCountdown()` → pauses countdown
  - `tickCountdown(seconds)` → advances countdown by N seconds (simulation)
  - `getRemaining()` → returns remaining seconds
  - `isComplete()` → returns boolean

- **Shared:**
  - `getReport()` → returns `{ stopwatch: { elapsed, laps }, countdown: { duration, remaining, complete } }`

| Challenge 📢 | Return timepiece API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const timepiece = createTimePieceEngine({ precision: "s", maxLaps: 5, onComplete: null })`
- `timepiece.start()`
- `timepiece.tickCountdown` *(separate)*
- `timepiece.lap()` *(after 10s tick)* ➔ `{ lapNumber: 1, lapTime: 10, totalTime: 10 }`
- `timepiece.lap()` *(after 5s more)* ➔ `{ lapNumber: 2, lapTime: 5, totalTime: 15 }`
- `timepiece.pause()` ➔ `15`
- `timepiece.setCountdown(60)`
- `timepiece.startCountdown()`
- `timepiece.tickCountdown(25)`
- `timepiece.getRemaining()` ➔ `35`
- `timepiece.tickCountdown(35)`
- `timepiece.isComplete()` ➔ `true`
- `timepiece.getReport()` ➔
  `{`
  `stopwatch: { elapsed: 15, laps: [{ lapNumber: 1, lapTime: 10 }, { lapNumber: 2, lapTime: 5 }] },`
  `countdown: { duration: 60, remaining: 0, complete: true }`
  `}`

---

## 🧩 PROBLEM–05: 🎭 Animation Timeline Engine

⚠️ **Function Name:** `createAnimationTimeline()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (timeline API)      |

**Rules:**

`config` object:

- `duration` (number) — total timeline duration in ms
- `easing` → `"linear"` | `"easeIn"` | `"easeOut"` | `"easeInOut"`
- `loop` (boolean) — whether timeline loops

**Easing Functions (simulate):**

- `"linear"` → `progress = t`
- `"easeIn"` → `progress = t * t`
- `"easeOut"` → `progress = t * (2 - t)`
- `"easeInOut"` → `progress = t < 0.5 ? 2*t*t : -1+(4-2*t)*t`

where `t = currentTime / duration` (0 to 1)

**Animation Timeline API (returned object):**

- `addKeyframe(name, property, startValue, endValue, startTime, endTime)` → registers keyframe
- `removeKeyframe(name)` → removes keyframe
- `getValue(name, currentTime)` → interpolates value at given time using easing
- `getSnapshot(currentTime)` → returns all property values at given time
- `play(tickMs)` → advances timeline by tickMs
  - Returns `{ currentTime, progress, values, isComplete }`
- `seek(timeMs)` → jumps to specific time
- `getKeyframes()` → returns all registered keyframes
- `getReport()` → returns `{ totalKeyframes, duration, easing, loop, currentTime }`

| Challenge 📢 | Return timeline API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const timeline = createAnimationTimeline({ duration: 1000, easing: "easeOut", loop: false })`
- `timeline.addKeyframe("opacity", "opacity", 0, 1, 0, 1000)`
- `timeline.addKeyframe("translateX", "x", 0, 300, 0, 1000)`
- `timeline.getValue("opacity", 500)` ➔ `0.75` *(easeOut at t=0.5: 0.5*(2-0.5)=0.75)*
- `timeline.getValue("translateX", 500)` ➔ `225` *(0.75 * 300)*
- `timeline.getSnapshot(250)` ➔ `{ opacity: 0.44, x: 131.25 }` *(easeOut at t=0.25)*
- `timeline.play(500)` ➔ `{ currentTime: 500, progress: 0.5, values: { opacity: 0.75, x: 225 }, isComplete: false }`
- `timeline.play(500)` ➔ `{ currentTime: 1000, progress: 1, values: { opacity: 1, x: 300 }, isComplete: true }`
- `timeline.getReport()` ➔ `{ totalKeyframes: 2, duration: 1000, easing: "easeOut", loop: false, currentTime: 1000 }`

---