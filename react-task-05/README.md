# Task 5 — Routing & Architecture: Meridian Crew

The Task 04 crew roster turned into a multi-page app with React Router: nested routes, filters in
the URL, a page per crew member, a dashboard, and lazy-loaded pages. It keeps the Task 04
architecture: the same course [fake API](https://github.com/leravanna/fake-api), the same thin
request layer, and only `useState` / `useEffect` from React. The only other hooks are React
Router's.

**Live:** https://mbfg9000.github.io/react-fall-2026/react-task-05/

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build into dist/ (base /react-fall-2026/react-task-05/)
```

## Routes

"Items" are crew members, so `/items` is `/crew`.

| Path | Page | Loaded |
| --- | --- | --- |
| `/` | Home: intro, illustration, links | eager |
| `/about` | About the project (+ link to the Task 02 About Me page) | lazy |
| `/crew` | Crew list: search, 2 filters, sorting, pagination | lazy |
| `/crew/:crewId` | Crew member details | lazy |
| `/dashboard` | Statistics, breakdowns, department filter | lazy |
| `/login` | Styled login placeholder (no auth) | lazy |
| `*` | Custom 404 with a Home link | eager |

## Structure

```
src/
  App.jsx                 routes only (createBrowserRouter + React.lazy)
  main.jsx                StrictMode + styles
  api/                    same as Task 04: fakeApi.js, settings.js, initial-data-sample.js
  services/service.js     every API request (Task 04's crewApi.js, moved and renamed)
  layouts/RootLayout.jsx  NavBar, <Suspense><Outlet/></Suspense>, notice, request log, network tools
  pages/                  one component per route + RouteErrorPage (router errorElement)
  components/             NavBar, CrewCard, CrewFilters, Pagination, CrewForm, Notice, RequestLog,
                          SimulatorPanel, StateMessage, Skeletons, StatusBadge, ClearanceMeter,
                          dashboard/ (StatTile, BarList, StatusSplit, ClearanceColumns)
  utils/                  plain functions: URL filters, addLog, page title, formatting, statistics
  styles/                 base, layout, components, pages
```

There is no `hooks/` folder: the app has no custom hooks. Each page loads its data in its own
`useEffect`, the same way `App.jsx` did in Task 04.

### Changes to the fake API

`src/api/fakeApi.js` is the provided file. The only change is two filters, `department` and
`status`, at its `//add other filter fields here` spot (10 lines). Search (name and description),
sorting (`name`, `name-desc`) and pagination are the API's own. `settings.js` keeps a `DATA_KEY`
unique to this task, because every task in this repo shares one GitHub Pages origin and one
`localStorage`.

## How the requirements are met

**Routing & architecture.** `App.jsx` only defines the route tree. Every page renders inside
`RootLayout` through `<Outlet />`. `NavBar` uses `NavLink` to highlight the current page, and on
mobile it becomes a menu that closes after navigating. A pathless route with `errorElement`
(`RouteErrorPage`) catches render crashes and failed lazy-chunk downloads, so the nav bar stays
usable.

`RootLayout` keeps the state that every page shares: the notice, the request log and a
`dataVersion` counter. It passes them to pages through `<Outlet context>`, and pages read them with
`useOutletContext()`.

**Crew list, with no filtering on the frontend.** Search, department, status, sort and page are
read from the URL with `useSearchParams`. `buildCrewQuery` turns them into a query string for
`getItemsList`. The fake API filters, sorts and pages; the browser only renders `data`.
- Typing in search is debounced (350 ms) with `setTimeout` in a `useEffect`, and it uses
  `replace`, so there is no history entry per key. Selects, sort and pages push history entries, so
  Back/Forward step through them.
- Invalid URL values fall back to defaults. `?page=9` jumps to the last real page.
- States: loading (skeleton cards), refreshing (old cards dimmed), error with **Try again**, empty
  roster, and "no matches" with **Clear filters**.

**Details.** `useParams` → `getItem(id)`. It shows 12 fields: id, callsign, name, role, status,
department (links to the filtered roster), homeworld, clearance, joined, time aboard, skills, bio,
plus last updated. It has **Back** (history back, or `/crew` when the page was opened directly) and
**All crew**. States:
- `/crew/abc`, `/crew/0`, `/crew/1.5` → **Invalid crew ID**, without sending a request.
- `/crew/999` → **Crew member not found** (the fake API's "Item not found").
- Network error → **Try again**.
- Stale responses: see below.

Task 04 features are kept: Report for duty / Stand down, Edit (modal), Remove, New member, Reload,
network presets, Reset data, and the request log.

**Dashboard.** It loads every crew member of the selected department in one request
(`?department=…&limit=1000`). The department is in the URL, so the API does the filtering. From
the response it computes 5 statistics: crew count, on duty now (and %), average clearance, average
time aboard, distinct skills / homeworlds. It shows 3 breakdowns: by department, by duty status,
by clearance level. It also lists the newest crew and the senior officers. Department bars, status
rows and cards link to the matching roster view or member page.

**Lazy loading.** Five pages use `React.lazy`, each in its own chunk. `<Suspense>` in
`RootLayout` shows a loader while a chunk downloads.

**Stale requests.** This works the same as in Task 04. Each request effect has its own
`let ignore = false`, and the cleanup sets it to `true`. A response that arrives after the user has
moved on (another member, another filter, another page) is dropped and logged as
*Ignored (stale)*. In `npm run dev`, StrictMode runs every effect twice, so the first request of
each page shows up as stale.

**Direct URLs, refresh, Back/Forward.** The build uses an absolute `base`. React Router's
`basename` is `import.meta.env.BASE_URL`. GitHub Pages only serves a `404.html` from the site root,
so the workflow copies `gh-pages-404.html` there. For paths under `/react-task-05/` it redirects to
the app as `?__spa=<path>`, and an inline script in `index.html` restores the real URL before the
router starts. Other paths get a plain 404.

## Try it

1. Footer **Network → Race demo**, then quickly switch between members with Back/Forward. Only
   the last one shows up, and the request log lists the others as *Ignored (stale)*.
2. Filter the roster, open a member, press **Back**. The filters are still there. Refresh: still
   there.
3. Dashboard → pick **Science**, then click a status row. The roster opens filtered by department
   and status.
4. **Flaky** network → Reload a few times to see error states and retries.
5. Visit `/crew/abc`, `/crew/999` and `/anything`.

## Deployment

Built and published by `.github/workflows/deploy.yml` at the repo root together with the other
tasks.
