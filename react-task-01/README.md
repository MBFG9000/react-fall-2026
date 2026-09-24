# Task 1 - JS Runtime and Async

Small app to practice closures, call stack, promises, async/await and the event loop.
Plain HTML/CSS/JS, no build, no libs. Just open `index.html`.

files:
- index.html
- styles.css
- script.js  <- everything happens here

## what it does

3 tasks: Load Users, Load Posts, Load Comments. Each one has a name, status, how many times it ran
and how long the last run took. You can run them one by one or all at once with "Run All Tasks".
Loading is faked with setTimeout inside a Promise, random 500-2000ms, and every run has a 30%
chance to fail (otherwise there'd be nothing to show in the Failed case).

Also there's a sequential vs concurrent comparison and the event loop demo button.

## closure / private counter

This is the main point of `createTask`:

```js
function createTask(name) {
    let count = 0;
    function run() { count += 1; /* ... */ }
    return { run, getCount: () => count, reset: () => { count = 0; } };
}
```

`count` is just a local variable inside createTask. But `run` and `getCount` were created inside
that function, so they still remember the scope even after createTask already returned. That's the
closure.

The returned object has no `count` property, so if you try `task.count` from outside you get
`undefined`. Only getCount() can read it and only run()/reset() can change it.

And since every call to createTask makes a new scope, every task has its own count. Load Users
counting to 5 doesn't touch Load Posts. I log this in the console at the start just to prove it.

## call stack (example from the app)

Clicking "Run" on Load Users:

1. click handler -> runSingle(task) goes on the stack
2. runSingle calls task.run() -> run goes on top
3. run does count += 1, sets status, calls onChange() -> onChange on top -> renderTasks() on top,
   finishes, both popped
4. run calls setTimeout - this returns instantly, it doesn't wait for anything - then returns a
   pending promise and gets popped
5. runSingle hits `await` so it pauses and gets popped too. stack is empty now, browser is free
   while the 500-2000ms are still counting
6. timer fires -> callback goes to the task queue -> event loop puts it on the empty stack ->
   promise resolves/rejects -> rest of runSingle runs as a microtask and prints the result

## how JS keeps going while setTimeout waits

setTimeout doesn't block. It hands the callback to the browser and returns immediately, so the rest
of the script keeps running on the same single thread. The waiting is done by the browser, not by
JS. When the time is up the callback goes into the task queue and waits for the stack to be empty.

Which also means the delay is a minimum, not a guarantee. If the stack is busy when the timer
expires the callback just waits its turn.

This is exactly why Run All works - 3 timers are counting down in the browser at the same time
while JS is doing nothing.

## event loop demo - predicted vs actual

The demo has 2 timers, 2 promise callbacks and 1 async function. Before running it I wrote down
what I expected:

```
1 script start
2 async start
7 script end
3 await resolved
4 promise then 1
5 promise then 2
6 chained then
8 timeout 0
9 microtask from timeout
10 timeout 10
```

Then I ran it and got exactly the same thing. (the numbers in the strings are my predicted order,
so if something was wrong it would be obvious)

why it comes out like that:

**Call stack first.** All the sync code runs: "1 script start", then asyncTask() is called and its
body runs normally until the first await, so "2 async start" prints here too (async functions are
NOT async until the await). Then "7 script end". The setTimeouts and the .then() calls also happen
in this phase but they only register stuff, they don't run anything.

**Then the microtask queue.** Everything after an `await` and every .then() callback is a microtask.
The stack is empty now so the event loop drains the whole microtask queue: "3 await resolved",
"4 promise then 1", "5 promise then 2", and then "6 chained then" - that last one only got queued
after the .then() before it finished, but it's still in the same drain.

**Then the task queue.** Now finally one macrotask: "8 timeout 0". That callback creates a new
microtask, and microtasks are drained after every task, so "9 microtask from timeout" goes next,
not the other timer.

**Next event loop iteration** takes the next task: "10 timeout 10".

Main takeaway for me: setTimeout(fn, 0) doesn't mean "now", it means "after the current code AND
after everything in the microtask queue".

## tasks vs microtasks

tasks (macrotasks) = setTimeout, setInterval, DOM events, I/O
microtasks = .then / .catch / .finally, code after await, queueMicrotask

Differences:
- microtasks have higher priority, they always run before the next task
- event loop takes only ONE task per iteration, but drains the ENTIRE microtask queue, including
  microtasks that got added while it was draining
- so a never ending chain of microtasks would starve the task queue and freeze the page. Tasks at
  least let the browser render in between.

## multiple promises + errors

Run All uses allSettled:

```js
const results = await Promise.allSettled(tasks.map(task => task.run()));
```

`tasks.map(...)` already starts all of them, so the 3 timers run in parallel. allSettled waits for
everything to settle and doesn't short circuit, so one failed task doesn't cancel or hide the other
two. Which is what I need here because failing is a normal result in this app, not a crash.

Each result comes back as `{status: 'fulfilled', value}` or `{status: 'rejected', reason}` and the
UI prints Completed / Failed per task. "All tasks finished" only prints after allSettled resolves.

Promise.all would've been wrong - it rejects on the first failure, so if Load Posts fails I lose the
results of the other two.

For a single task I just use try/catch around `await task.run()`, same thing as .then/.catch.
Failures are real rejected promises (`reject(new Error(...))`), nothing is left unhandled.

## sequential vs concurrent

sequential:
```js
await task1.run();
await task2.run();
await task3.run();
```
every await pauses until that task is done, so timer 2 only starts after timer 1 finished.
total = sum of all delays, so about 1500-6000ms here.

concurrent:
```js
await Promise.allSettled([task1.run(), task2.run(), task3.run()]);
```
all three run() calls happen before any await, so all 3 timers start at the same moment.
total = the longest single one, about 500-2000ms.

The "Run Comparison" button runs both and prints the real measured times + the difference.

And the reason it's faster is NOT extra threads, JS is still single threaded. It's that the waiting
is done by the browser timers, so the waits can overlap. Sequential is still the right choice if one
task needs the result of the previous one. Here they're independent so concurrent makes sense.
