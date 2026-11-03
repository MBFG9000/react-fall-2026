// Same helper as in Task 04's App.jsx, moved here because several pages use it.
// It only receives the state setter (which React keeps stable), so effects can
// call it without listing it as a dependency.
//
// outcome: 'ok' | 'error' | 'stale'
let logSeq = 0;

export function addLog(setLog, label, outcome, startedAt) {
    const entry = { id: ++logSeq, label, outcome, ms: Date.now() - startedAt };
    setLog((prev) => [entry, ...prev].slice(0, 40));
}
