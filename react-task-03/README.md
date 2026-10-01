# Task 3 — Rendering and State: Glasshouse

A single-page React dashboard for looking after houseplants. Each plant card has shared data
(kept in the parent `App`) and its own local state (kept inside the card).

**Live:** https://mbfg9000.github.io/react-fall-2026/react-task-03/

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build into dist/
```

## Features

| Requirement | Where |
| --- | --- |
| Add / remove items | `AddPlantForm` → `App.handleAdd`, card **Remove** → `App.handleRemove` |
| Edit an item's status | Status pill on each card → `App.handleStatusChange` |
| Change an item's local state | **Log watering**, **Care notes** (open/close + text) inside `PlantCard` |
| Filter | Search, room select and status chips in `Toolbar` |
| Reorder / reverse | **Sort** select and **Reverse** button |
| Reset an item's local state | **Reset card** → changes the card's key |
| Preserve local state on filter/reorder | Stable keys (`plant.id`) + filtered cards stay mounted |
| `console.log` re-renders | Every component logs `[render] Name`; cards also log `[mount]` |

## Structure

- `src/App.jsx` — parent state: `plants`, `filters`, `sortBy`, `isReversed`, `keyMode`. Sorting and
  filtering are derived during render, not stored.
- `src/components/Header.jsx` — title and a summary computed from props.
- `src/components/AddPlantForm.jsx` — child with its own state (form fields, validation error).
- `src/components/Toolbar.jsx` — search, room, sort, reverse, status chips with counts.
- `src/components/PlantList.jsx` — renders the list with `.map()` and keys; empty states.
- `src/components/PlantCard.jsx` — one plant; local state `waterings`, `note`, `isNotesOpen`.
- `src/components/KeyExperiment.jsx` — switches keys between plant id and array index (demo).
- `src/data/plants.js` — initial data and option lists.

## Defence notes

**Re-rendering.** A component re-renders when its own state changes or its parent re-renders.
Open DevTools → Console. Clicking **Log watering** on one card logs only that `PlantCard`, because
the state lives in the card. Changing a status logs `App` and then every child, because `plants`
lives in `App`. Typing in the add form logs only `AddPlantForm`.

**Reconciliation and identity.** After a render React compares the new element tree with the
previous one. A component keeps its identity (and its state) when it is the same type at the same
position, and for lists, "position" means the **key**. Same key → same component, state kept.
New key → old component unmounted, new one mounted with fresh state.

**Mount vs re-render without `useEffect`.** `PlantCard` uses a lazy `useState` initializer that
logs `[mount]`. It runs only when a card is created, so you can see exactly when React creates new
cards (first load, add, reset) and when it only re-renders existing ones (sort, reverse, filter).

**State preservation.** Cards are keyed by `plant.id`. Water Jade plant twice and write a note, then
sort or reverse: the drops and note move with Jade plant. Filtering hides non-matching cards with
the `hidden` attribute instead of removing them from the array, so they stay mounted and their
state is still there when the filter is cleared. (If they were removed from the array, React would
unmount them and their local state would be lost.)

**Intentional reset with keys.** The key is `` `${plant.id}-${plant.resetCount}` ``. **Reset card**
increases `resetCount`, so the key changes and React treats it as a different component: the old
card is unmounted and a new one mounts with initial state (see the `[mount]` log).

**Why index keys are wrong (Key experiment panel).** Switch to **Array index** (this itself changes
every key, so all cards remount), water the first card, then press **Reverse**. The drops stay at
position 0 while the plant there is now a different one: state follows the index, not the plant.
**Reset card** also stops working, because the key no longer includes `resetCount`.

`StrictMode` is not used so each render is logged once in development.

## Deployment

Deployed by `.github/workflows/deploy.yml` at the repo root together with the other tasks.
