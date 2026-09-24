/* ============================================================
   Task 1 - JavaScript Runtime and Async
   Closures, Call Stack, Promises, async/await, Event Loop
   ============================================================ */

/* ------------------------------------------------------------
   1. createTask - a factory built on a closure.
   `count`, `status` and `lastDuration` are local variables of
   createTask. Nothing outside can touch them directly, the
   returned methods are the only way in. Every call to
   createTask creates a brand new scope, so every task gets
   its own private counter.
   ------------------------------------------------------------ */
function createTask(name, failChance = 0.3) {
    let count = 0;              // private execution counter
    let status = 'idle';        // idle | loading | completed | failed
    let lastDuration = null;    // ms of the last run
    let running = false;

    function run() {
        if (running) {
            return Promise.reject(new Error(name + ' is already running'));
        }

        running = true;
        count += 1;
        status = 'loading';
        lastDuration = null;
        onChange();

        const delay = Math.floor(Math.random() * 1500) + 500; // 500-2000 ms
        const startedAt = performance.now();

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const duration = Math.round(performance.now() - startedAt);
                lastDuration = duration;
                running = false;

                if (Math.random() < failChance) {
                    status = 'failed';
                    onChange();
                    reject(new Error(name + ' failed after ' + duration + ' ms'));
                } else {
                    status = 'completed';
                    onChange();
                    resolve({ name: name, duration: duration });
                }
            }, delay);
        });
    }

    return {
        name: name,
        run: run,
        getCount: function () {
            return count;
        },
        getStatus: function () {
            return status;
        },
        getDuration: function () {
            return lastDuration;
        },
        reset: function () {
            count = 0;
            status = 'idle';
            lastDuration = null;
            onChange();
        }
    };
}

/* ------------------------------------------------------------
   2. The tasks of the application
   ------------------------------------------------------------ */
const tasks = [
    createTask('Load Users'),
    createTask('Load Posts'),
    createTask('Load Comments')
];

/* ------------------------------------------------------------
   3. UI rendering
   ------------------------------------------------------------ */
const tasksBody = document.getElementById('tasks-body');
const runAllOutput = document.getElementById('run-all-output');
const compareOutput = document.getElementById('compare-output');
const eventLoopOutput = document.getElementById('event-loop-output');
const predictedOutput = document.getElementById('predicted-output');

// true while a batch run is in progress, so buttons stay disabled
// even when the table is re-rendered in the middle of it
let busy = false;

function renderTasks() {
    tasksBody.innerHTML = '';

    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        const status = task.getStatus();
        const duration = task.getDuration();

        row.innerHTML =
            '<td>' + task.name + '</td>' +
            '<td><span class="status status-' + status + '">' + statusLabel(status) + '</span></td>' +
            '<td>' + task.getCount() + '</td>' +
            '<td>' + (duration === null ? '—' : duration + ' ms') + '</td>' +
            '<td></td>';

        const actions = row.lastElementChild;

        const runBtn = document.createElement('button');
        runBtn.textContent = 'Run';
        runBtn.className = 'small';
        runBtn.disabled = busy;
        runBtn.addEventListener('click', () => runSingle(task));

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.className = 'small secondary';
        resetBtn.disabled = busy;
        resetBtn.addEventListener('click', () => task.reset());

        actions.appendChild(runBtn);
        actions.appendChild(resetBtn);
        tasksBody.appendChild(row);
    });
}

function statusLabel(status) {
    if (status === 'idle') return 'Idle';
    if (status === 'loading') return 'Loading...';
    if (status === 'completed') return 'Completed';
    return 'Failed';
}

// called from inside the closure whenever a task changes
function onChange() {
    renderTasks();
}

function print(element, text) {
    element.textContent += text + '\n';
}

function clear(element) {
    element.textContent = '';
}

/* ------------------------------------------------------------
   4. Running tasks
   ------------------------------------------------------------ */
async function runSingle(task) {
    try {
        const result = await task.run();
        print(runAllOutput, result.name + ' -> Completed in ' + result.duration + ' ms');
    } catch (error) {
        print(runAllOutput, error.message + ' -> Failed');
    }
}

// Run All: start every task at the same time, report when all settle.
async function runAll() {
    clear(runAllOutput);
    setButtonsDisabled(true);

    const started = performance.now();

    // allSettled never short-circuits: one rejection does not cancel the rest
    const results = await Promise.allSettled(tasks.map(task => task.run()));

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            print(runAllOutput, tasks[index].name + '       Completed (' + result.value.duration + ' ms)');
        } else {
            print(runAllOutput, tasks[index].name + '       Failed (' + result.reason.message + ')');
        }
    });

    const total = Math.round(performance.now() - started);
    print(runAllOutput, '');
    print(runAllOutput, 'All tasks finished in ' + total + ' ms');

    setButtonsDisabled(false);
}

function setButtonsDisabled(disabled) {
    busy = disabled;
    document.querySelectorAll('button').forEach(button => {
        button.disabled = disabled;
    });
}

/* ------------------------------------------------------------
   5. Sequential vs concurrent
   ------------------------------------------------------------ */

// Each await blocks the next line -> the delays add up.
async function runSequential(output) {
    const started = performance.now();

    for (const task of tasks) {
        try {
            const result = await task.run();
            print(output, '  ' + result.name + ' completed in ' + result.duration + ' ms');
        } catch (error) {
            print(output, '  ' + error.message);
        }
    }

    const total = Math.round(performance.now() - started);
    print(output, 'Sequential total: ' + total + ' ms');
    return total;
}

// All run() calls happen before any await -> all timers overlap.
async function runConcurrent(output) {
    const started = performance.now();

    const results = await Promise.allSettled(tasks.map(task => task.run()));

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            print(output, '  ' + tasks[index].name + ' completed in ' + result.value.duration + ' ms');
        } else {
            print(output, '  ' + result.reason.message);
        }
    });

    const total = Math.round(performance.now() - started);
    print(output, 'Concurrent total: ' + total + ' ms');
    return total;
}

async function runComparison() {
    clear(compareOutput);
    setButtonsDisabled(true);

    print(compareOutput, 'Sequential (await one by one):');
    const sequentialTime = await runSequential(compareOutput);

    print(compareOutput, '');
    print(compareOutput, 'Concurrent (Promise.allSettled):');
    const concurrentTime = await runConcurrent(compareOutput);

    print(compareOutput, '');
    print(compareOutput, 'Difference: ' + (sequentialTime - concurrentTime) + ' ms saved by running concurrently.');
    print(compareOutput, 'Sequential waits for each timer in turn, concurrent starts all timers at once,');
    print(compareOutput, 'so it takes about as long as the slowest single task.');

    setButtonsDisabled(false);
}

/* ------------------------------------------------------------
   6. Event Loop demo
   2 timers, 2 promise callbacks, 1 async function
   ------------------------------------------------------------ */
const PREDICTED_OUTPUT = [
    '1 script start',
    '2 async start',
    '7 script end',
    '3 await resolved',
    '4 promise then 1',
    '5 promise then 2',
    '6 chained then',
    '8 timeout 0',
    '9 microtask from timeout',
    '10 timeout 10'
].join('\n');

function eventLoopDemo() {
    clear(eventLoopOutput);

    const log = (message) => {
        print(eventLoopOutput, message);
        console.log(message);
    };

    // async function: the body runs synchronously until the first await
    async function asyncTask() {
        log('2 async start');
        await Promise.resolve();          // everything below becomes a microtask
        log('3 await resolved');
    }

    log('1 script start');                // call stack

    setTimeout(() => {                    // timer 1 -> task queue
        log('8 timeout 0');
        Promise.resolve().then(() => {    // microtask created inside a task
            log('9 microtask from timeout');
        });
    }, 0);

    setTimeout(() => {                    // timer 2 -> task queue, later
        log('10 timeout 10');
    }, 10);

    asyncTask();                          // runs up to the await, then returns

    Promise.resolve().then(() => {        // microtask 1
        log('4 promise then 1');
    });

    Promise.resolve()
        .then(() => {                     // microtask 2
            log('5 promise then 2');
        })
        .then(() => {                     // queued once the previous one finishes
            log('6 chained then');
        });

    log('7 script end');                  // still the same synchronous run
}

/* ------------------------------------------------------------
   7. Wire up
   ------------------------------------------------------------ */
document.getElementById('run-all').addEventListener('click', runAll);

document.getElementById('reset-all').addEventListener('click', () => {
    tasks.forEach(task => task.reset());
    clear(runAllOutput);
});

document.getElementById('run-sequential').addEventListener('click', async () => {
    clear(compareOutput);
    setButtonsDisabled(true);
    print(compareOutput, 'Sequential (await one by one):');
    await runSequential(compareOutput);
    setButtonsDisabled(false);
});

document.getElementById('run-concurrent').addEventListener('click', async () => {
    clear(compareOutput);
    setButtonsDisabled(true);
    print(compareOutput, 'Concurrent (Promise.allSettled):');
    await runConcurrent(compareOutput);
    setButtonsDisabled(false);
});

document.getElementById('run-comparison').addEventListener('click', runComparison);
document.getElementById('run-event-loop').addEventListener('click', eventLoopDemo);

predictedOutput.textContent = PREDICTED_OUTPUT;
renderTasks();

/* Quick proof in the console that the counters really are private
   and separate for every task. */
console.log('task.count from outside:', tasks[0].count);   // undefined - it is closed over
console.log('Load Users count:', tasks[0].getCount());     // 0
console.log('Load Posts count:', tasks[1].getCount());     // 0
