# Task 4 — Async React: Meridian Crew Roster

A crew roster for a research vessel, backed by the provided
[fake API](https://github.com/leravanna/fake-api) (Promises, random delays, random errors, data in
`localStorage`). Only `useState` and `useEffect` are used, with no custom hooks, debouncing or
fetching libraries.

**Live:** https://mbfg9000.github.io/react-fall-2026/react-task-04/

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build into dist/
```

## Features

| Requirement | Where |
| --- | --- |
| 7+ detail fields | Name, role, department, status, homeworld, clearance, callsign, joined date, skills, bio, last updated (`CrewDetails`) |
| List loaded with `useEffect` | List effect in `App.jsx`, deps `[search, sort, page, reloadKey]` |
| Create / Edit / Remove | **New member**, **Edit**, **Remove** → `handleCreate`, `handleSave`, `handleDelete` |
| Async details on select | Details effect in `App.jsx`, deps `[selectedId, detailsReloadKey]`. The list shows only 4 summary fields, the rest comes from `getItem` |
| Update the selected item | **Report for duty / Stand down** → `handleToggleDuty` (`PATCH status`) |
| Loading / error / empty / success | `CrewList` and `CrewDetails` (skeletons, error + Try again, empty roster, no search match) |
| Reload button | Toolbar **Reload** → bumps `reloadKey` |
| Cleanup | `ignore` flag in both request effects, `clearTimeout` for the notice, `removeEventListener` for Escape in `CrewForm` |
| Race conditions | Stale responses are dropped and logged as **Ignored (stale)** in the Request log |
| Stale closures | Actions capture `id` at start, update state with updater functions, and lock the item via `pending` |

## Structure

- `src/api/fakeApi.js` — the provided API, **not modified**.
- `src/api/settings.js` — delays, error chance, and a `DATA_KEY` unique to this task (every task in
  this repo shares the same GitHub Pages origin, so they share one `localStorage`).
- `src/api/initial-data-sample.js` — 10 seed crew members with all fields.
- `src/api/crewApi.js` — thin layer: re-exports the API, `createCrewMember`, `resetDatabase`,
  network presets. Components never touch `localStorage`.
- `src/App.jsx` — all shared state, the effects and the actions.
- `src/components/` — `Header` (network preset, reset data), `Toolbar`, `CrewList`, `CrewDetails`,
  `CrewForm` (modal), `RequestLog`, `Notice`.

`createItem` in the fake API only saves `name` and `description`. Since the API must not change,
`createCrewMember` creates the item, then PATCHes the other fields onto it. If the PATCH fails, it
deletes the half-created item and re-throws the error.

## Defence notes

**`useEffect`.** Synchronises a component with something outside React (here: the fake server, a
timer, a window listener). React runs it after the render is committed to the screen.

**Dependencies.** The array lists every reactive value the effect reads. React re-runs the effect
only when one of them changes (`Object.is`). The list effect reads `search`, `sort`, `page`, so they
are all deps. `reloadKey` is a counter whose only job is to force a re-run (Reload button).
State setters are stable, so they are not listed. `addLog` sits outside the component for the
same reason.

**Cleanup.** The function returned from the effect. React calls it before running the effect again
and on unmount. In development `StrictMode` mounts → unmounts → mounts each component. That is why
the first request of each effect shows up as *Ignored (stale)* in the log in `npm run dev`.

**Race conditions.** Each effect run has its own `let ignore = false`. Cleanup sets it to `true`.
If you click A and then B, A's cleanup runs before B's effect starts, so when A's slow response
arrives `ignore` is `true` and it is thrown away. The details state is also cleared at the start of
each run, so A's data can never appear under B. Typing in search works the same way: each
keystroke starts a request, and only the latest one is shown.

**Stale closures.** An async handler sees state from the render it was created in. So:
1. `handleToggleDuty(member)` captures `const id = member.id` when it starts, and the response is
   applied to *that* id, not to whatever `selectedId` is when it finishes.
2. Updates use updater functions (`setItems(prev => ...)`, `setDetails(prev => prev?.id === id ?
   updated : prev)`), so they work on the latest state instead of the old snapshot. The details
   panel changes only if it still shows the same member.
3. `pending[id]` blocks conflicting actions (toggle, edit, remove) on that member until the request
   finishes. The row shows *Updating… / Saving… / Removing…*.

### How to demonstrate

1. Set **Network → Race demo (0.2–4 s, no errors)**.
2. Click several crew members quickly. Only the last one's details appear. Earlier responses show
   up in the Request log as *Ignored (stale)*.
3. Type fast in the search box. Each keystroke starts a request, and only the last one is used.
4. Select A, press **Stand down**, and immediately select B. B's details load, and when A's PATCH
   finishes only A's row badge changes. Go back to A: the new status is there.
5. Set **Flaky (35% errors)** and press **Reload** a few times to see the error state and **Try
   again**.
6. **Reset data** restores the seed crew.

## Deployment

Deployed by `.github/workflows/deploy.yml` at the repo root together with the other tasks.
