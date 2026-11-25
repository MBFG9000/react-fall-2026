# Task 8 — Redux Toolkit: Meridian Crew

The Task 07 app (routes, filters, pagination, dashboard, CRUD, Firebase auth, PWA, offline) refactored to
keep its server data in a **Redux Toolkit** store. Every feature from the earlier tasks still works the
same way. No other state management library is used.

**Live:** https://mbfg9000.github.io/react-fall-2026/react-task-08/

## Structure

```
src/
  store/index.js            configureStore: the one store (given to React by <Provider> in main.jsx)
  store/runRequest.js       shared thunk body: call the API, write the request log, return data or rejectWithValue
  features/
    crew/crewSlice.js       crew members (entity adapter), list/details request state, mutations in flight
    crew/crewThunks.js      fetchCrewList, fetchCrewMember, createCrewMember, updateCrewMember, deleteCrewMember, resetCrewData
    crew/crewSelectors.js   selectors of the crew feature (2 memoized)
    news/newsSlice.js       articles (entity adapter) + list pages + article request state
    news/newsThunks.js      fetchNewsPage, fetchNewsArticle
    news/newsSelectors.js   selectors of the news feature (1 memoized)
    requestLog/requestLogSlice.js       footer request log + selectors (1 memoized)
    notifications/notificationsSlice.js the toast ("X was removed")
  hooks/                    custom hooks between pages and the store:
                            useCrewList, useCrewStats, useCrewMember, useNewsPage / useNewsArticle, useLastValue
  services/crewApi.js       crew API requests (fake API); newsApi.js: Spaceflight News API
  context/AuthContext.jsx   authentication (unchanged)
  pages/, components/       UI
```

The layers only talk in one direction: **UI component → custom hook → thunk → API service**.
Components never call a service, and services know nothing about Redux. Mutations are dispatched from
the pages (`dispatch(updateCrewMember(...)).unwrap()`), because the page decides what happens next
(close the form, show a toast, navigate).

### What is *not* in Redux

| State | Where | Why |
| --- | --- | --- |
| Signed-in user, login/signup/logout | `AuthContext` | Firebase keeps the session; the context only mirrors `onAuthStateChanged`. |
| Search, filters, sort, page | URL (`useSearchParams`) | Shareable links, Back/Forward. The query string is used as the store key instead of copying the filters. |
| Typed search text (debounce), open modal, form fields, "log expanded", network preset | `useState` in the component | Temporary UI state that nobody else needs. |

## Slices

| Slice | State | Why it is global |
| --- | --- | --- |
| `crew` | `ids` + `entities` (one copy of every member), `lists[query]`, `details[id]`, `pendingById[id]`, `version` | Shared by the roster, member pages and the dashboard. |
| `news` | `ids` + `entities` (articles), `pages[page]`, `details[id]` | Pages already opened are shown again without a request; an article opened from the list is shown at once. |
| `requestLog` | `entries` | Written by every crew thunk, read by the footer on every page. |
| `notifications` | `notice` | A page shows "X was removed" right before navigating away; the toast must survive the navigation. |

**No duplicated state.** Members and articles are normalized with `createEntityAdapter`: a list only keeps
ids (`lists["?sort=name&page=1&limit=6"].ids = [3, 1, 7, …]`), and the dashboard is just another list
(`?page=1&limit=1000`). So an edit on the member page shows up on the roster card and in the dashboard
without a second copy to keep in sync. Values like the dashboard statistics are not stored; selectors
calculate them.

Each list / details entry stores its request state:
`{ status: 'idle' | 'loading' | 'success' | 'error' | 'not-found', error, requestId, version }`.

## Thunks

| Thunk | Kind | What it does |
| --- | --- | --- |
| `fetchCrewList({ query, force })` | list | One page of the roster (also the dashboard, with a big `limit`). |
| `fetchCrewMember({ id, force })` | details | One member. An unknown id ends in `status: 'not-found'`. |
| `createCrewMember(data)` | mutation | POST + PATCH (as in Task 06). |
| `updateCrewMember({ id, changes, action })` | mutation / business operation | Edit, or *Report for duty / Stand down* (`action: 'status'`). |
| `deleteCrewMember({ id })` | mutation | Remove. |
| `resetCrewData()` | business operation | "Reset data" in the footer. |
| `fetchNewsPage({ page, force })` | list | One Spaceflight News page. |
| `fetchNewsArticle({ id, force })` | details | One article. |

All of them handle **pending / fulfilled / rejected in `extraReducers`** of their slice. Errors are turned
into plain objects with `rejectWithValue` (`{ message, notFound, offline }`), because Redux state must be
serializable and a thrown `Error` would lose the custom fields.

**Loading, errors, empty results.** `pending` → `loading` (first load: skeleton; with old results: the old
cards stay on screen, dimmed — `useLastValue`), `rejected` → error message with **Try again**, an empty
`ids` list → "no matches" with **Clear filters** / "the roster is empty".

**Retries.** **Try again** and **Reload** dispatch the thunk with `force: true`.

**Unnecessary requests.** Every query thunk has a `condition`: if the store already has a fresh answer
(`status === 'success'` and loaded at the current `version`), the thunk does not start at all. Going back
to page 1, or opening the dashboard twice, shows the data at once. A news page that came from the Service
Worker's offline copy is not "fresh", so the next visit tries the network again.

**Stale requests.** The hooks start the thunk in an effect and abort it in the cleanup
(`const request = dispatch(fetchCrewList(...)); return () => request.abort();`). Each entry also remembers
the `requestId` of its newest request, and `fulfilled` / `rejected` of an older request are ignored. So:

- typing again / changing a filter / opening another member before the answer → the old request is aborted;
- pressing Reload while a request is running → only the newest answer is used;
- in both cases the request log shows *Ignored (stale)*. In development StrictMode runs every effect twice,
  so the first request of each page is always aborted (same as in the earlier tasks).

**Refreshing after mutations.** `crew.version` goes up after every create, update, delete and reset. Every
entry remembers the version it was loaded at, and the crew hooks have `version` in their effect
dependencies: the open page loads again at once, and every other list and the dashboard load again the
next time they are shown. The mutation's own answer is stored directly (the edited member, the new member,
"not found" for the removed one), so the member page does not ask the server for something it just got.

## Selectors

All reads go through selectors (`useSelector((state) => selectX(state, arg))`):

| Selector | Memoized | Returns |
| --- | --- | --- |
| `selectCrewListResult(state, query)` | **yes** (`createSelector`) | `{ members, total, page, totalPages }`: the ids of a list turned into members |
| `selectCrewStats(state, query)` | **yes** | dashboard statistics (`computeCrewStats`), recalculated only when the list or its members change |
| `selectNewsPageResult(state, page)` | **yes** | `{ articles, count, totalPages, fromCache, cachedAt }` |
| `selectStaleCount(state)` | **yes** | number of stale requests in the log |
| `selectCrewMemberById`, `selectCrewEntities` | (entity adapter) | one member / all members by id |
| `selectCrewListEntry`, `selectCrewDetailsEntry`, `selectPendingAction`, `selectCrewVersion` | no (plain lookups) | request state |
| `selectArticleById`, `selectNewsPageEntry`, `selectArticleEntry`, `selectLogEntries`, `selectNotice` | no | news / log / toast |

Memoization matters here: `selectCrewListResult` builds a new array from ids. Without `createSelector`
every `useSelector` call would return a new object and re-render the page after any action. With it, the
result stays the same object until the list or the members change.

## Custom hooks

| Hook | Used by | Returns |
| --- | --- | --- |
| `useCrewList(query)` | `CrewListPage` | `{ result, status, error, reload }` |
| `useCrewStats(department)` | `DashboardPage` | `{ stats, status, error, reload }` (built on `useCrewList`) |
| `useCrewMember(id)` | `CrewDetailsPage` | `{ member, status, error, pendingAction, retry }` |
| `useNewsPage(page)`, `useNewsArticle(id)` | news pages | data + `retry`; offline without a saved copy they open `/offline` |
| `useLastValue(value)` | the crew hooks | keeps the previous results while new ones load |

## What stayed the same

- Authentication in `AuthContext`, `ProtectedRoute` for `/profile`, persistent session, Google sign-in.
- URL search params, 350 ms debounce of the search box, filters, sorting, pagination, `?page` out of
  range → last page.
- CRUD: create, edit, duty status, remove (the "Saving… / Updating… / Removing…" buttons now come from
  `crew.pendingById`).
- PWA: manifest, Service Worker pre-cache and runtime caches, update banner, offline page, cached-data
  notice. The news thunks pass the abort `signal` to `fetch`.
- Request log and network presets in the footer.

The in-memory cache of Task 06 (`services/cache.js`) was removed: the store is the cache now, and keeping
both would be the duplicated state this task asks to avoid.

## Try it

1. Open the roster, go to page 2, then back to page 1: page 1 appears at once and the log shows no new request.
2. Pick **Race demo** in the footer and type fast in the search: older requests show *Ignored (stale)*.
3. Open a member from the roster: the card data is shown at once, the full record loads in the background.
   Press **Stand down** and go back: the roster loads again and shows the new status. So does the dashboard.
4. Pick **Flaky**: errors appear with **Try again**, which retries.
5. With the Redux DevTools browser extension you can see every `crew/fetchList/pending → fulfilled` action
   and the state.

---

# Task 7 — PWA: Meridian Crew

The Task 06 app (routes, filters, pagination, dashboard, API cache, Firebase auth) turned into an
installable Progressive Web App that works offline. Everything from Task 06 still works the same way.

## What was added

| Requirement | Where |
| --- | --- |
| Manifest (`name`, `short_name`, `start_url`, `scope`, `display: standalone`, colours, 192/512 icons) | `public/manifest.json`, `public/icons/`, linked in `index.html` |
| Service Worker (`install`, `activate`, `fetch`, `message`) | `src/pwa/sw.js` (template) → `dist/sw.js` (built by a small plugin in `vite.config.js`) |
| Registration + "new version available" banner with **Update** | `src/components/UpdateBanner.jsx` |
| Public API with list + details (real network requests) | `src/services/newsApi.js`, `/news`, `/news/:articleId` ([Spaceflight News API](https://api.spaceflightnewsapi.net/v4/docs/)) |
| "You are viewing cached data" notice | `src/components/CachedDataNotice.jsx` |
| Online / offline indicator | `src/components/ConnectionStatus.jsx` (in the NavBar) |
| `/offline` page with **Retry Connection** | `src/pages/OfflinePage.jsx` |
| Mobile rules (touch sizes, 320px, landscape menu) | `src/styles/pwa.css` |

### Service Worker

**Pre-cache (install).** The Vite plugin `serviceWorker()` in `vite.config.js` reads the file names of
the build (they contain content hashes) and writes them into `sw.js`: the index page (app shell), every
JS/CSS chunk, the manifest and the icons. The `/offline` page is a React route in the main bundle, so it
is part of the pre-cache too. Files are fetched with `cache: 'reload'`, so an update never stores a stale
`index.html` from the browser's HTTP cache.

**Versioned caches (activate).** All caches start with `react-task-08-` (the GitHub Pages origin is
shared with the other tasks):

| Cache | Strategy | Limit |
| --- | --- | --- |
| `react-task-08-precache-<build hash>` | pre-cached app shell | new one for every deploy |
| `react-task-08-static-v1` | **cache-first**: icons, images, fonts, stylesheets | 60 entries |
| `react-task-08-api-v1` | **network-first**: news list and details | 50 entries |
| `react-task-08-pages-v1` | list of visited routes (for offline navigation) | 50 entries |

On `activate` every `react-task-08-*` cache that is not in this list is deleted (e.g. the previous
precache), then `clients.claim()` takes over open tabs. When a cache is over its limit, the oldest
entries are removed.

**Updates.** The build hash is the SW version, so every deploy produces a different `sw.js`. The
browser installs it in the background (the app also calls `registration.update()` every 30 minutes).
The new worker does **not** call `skipWaiting()` by itself: it waits, and the banner
*"A new version of Meridian Crew is available"* appears. **Update** sends `SKIP_WAITING`, the new worker
activates, removes the old caches, and the page reloads once on `controllerchange`. No manual clearing of
storage is needed.

**Fetch routing.**

- Navigations: network-first. Offline, the pre-cached shell is served for `/`, `/offline` and every
  route that was visited before (the app reports each route to the SW with `postMessage`, because router
  navigations never reach the SW). Any other route redirects to `/offline?from=<route>`.
- `api.spaceflightnewsapi.net`: network-first (with `cache: 'no-cache'`, so the browser HTTP cache
  cannot hide that we are offline). A cached answer gets an `X-From-Cache` header, and the page shows
  *"You are offline. Showing saved data from …"*. Offline without a saved copy the SW answers
  `503 + X-Offline`, and the news page opens `/offline`.
- Own files, images, fonts: cache-first.
- **Everything else is not touched**: Firebase Auth, Google sign-in and token requests go straight to the
  network and are never written to a cache. Only `GET` requests are handled at all.
- Failed requests return a small error response instead of throwing, and the pages show an error with
  **Try again**.

The crew roster itself does not need the SW for its data: the course fake API keeps it in
`localStorage`, so the roster, member pages and dashboard work offline anyway (the SW only makes their
code available).

### Offline page

`/offline` explains which page could not be opened, has **Retry Connection** (a full page load, so it
really tries the network; offline it shows *"Still offline"*), and goes back to the wanted page by itself
when the `online` event fires.

### Try it

1. Open the live site in Chrome → the install icon in the address bar (or *Install app* in the menu).
2. Open **News**, an article, and **Crew**. DevTools → Application → Service Workers → *Offline*.
3. Reload `/news` and the article: they open with the yellow *saved data* notice. The pill in the
   navigation bar says *Offline*.
4. Open `/dashboard` (if you never visited it) or page 3 of the news → the offline page. Turn the network
   back on → it returns to the page by itself.
5. Deploy a change (or edit `dist/sw.js` under `vite preview`) → the update banner appears.

`npm run build && npm run preview` serves the production build with the Service Worker at
`http://localhost:4173/react-fall-2026/react-task-08/` (`npm run dev` does not register it).

---

# Task 6 — Server Data, Caching & Firebase Authentication

The Task 05 app (routes, filters, pagination, dashboard) with three additions:

- a cache for API responses, cleared after every change to the data;
- environment variables for the Firebase config;
- Firebase Authentication: email/password and Google, with a protected `/profile` page.

## Setup

1. Create a Firebase project. In **Authentication → Sign-in method** enable **Email/Password** and
   **Google**.
2. Add a Web app to the project and copy its config.
3. Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` is in `.gitignore`. Vite only gives the browser variables that start with `VITE_`,
   and `src/firebase.js` reads them with `import.meta.env.VITE_…`.
4. For the deployed site, add the domain `mbfg9000.github.io` in **Authentication → Settings →
   Authorized domains** (`localhost` is there by default).

```bash
npm install
npm run dev      # dev server
npm run build    # production build into dist/ (base /react-fall-2026/react-task-08/)
npm run preview  # serve the build, with the Service Worker
```

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | everyone |
| `/about` | About the project | everyone |
| `/crew` | Crew list: search, 2 filters, sorting, pagination | everyone |
| `/crew/:crewId` | Crew member details, edit, remove | everyone |
| `/dashboard` | Statistics with a department filter | everyone |
| `/login` | Email/password login and Google sign-in | everyone |
| `/signup` | Email, password, confirm password, with validation | everyone |
| `/profile` | The user's email and UID, Log out | **signed-in users only** |
| `/news` | Space news list (public API, cached offline) | everyone |
| `/news/:articleId` | Article details (public API, cached offline) | everyone |
| `/offline` | Offline page with Retry Connection | everyone |
| `*` | 404 | everyone |

## Structure

```
src/
  firebase.js             initializeApp + getAuth + Google provider, config from .env.local
  context/AuthContext.jsx AuthProvider and useAuth()
  services/service.js     every API request (cached reads, mutations that clear the cache)
  services/cache.js       the cache itself: cachedRequest(key, request), invalidateCache(prefix)
  components/ProtectedRoute.jsx   redirects to /login when nobody is signed in
  pages/                  LoginPage, SignupPage, ProfilePage + the Task 05 pages
  api/                    the course fake API (unchanged since Task 05)
  layouts/, components/, utils/, styles/   as in Task 05
```

UI components never call Firebase, `fakeApi.js` or `localStorage` directly. Pages use `useAuth()`
for authentication and functions from `services/service.js` for data.

## Authentication

- `AuthProvider` (in `main.jsx`, around the whole app) keeps `user` and `loading` in state.
  An effect subscribes to `onAuthStateChanged` and unsubscribes in its cleanup.
- `loading` is `true` until Firebase restores the saved session. Meanwhile `ProtectedRoute` shows a
  loader instead of redirecting, and the NavBar hides its auth buttons so they do not flicker.
- **Persistent sessions:** `firebase.js` calls `setPersistence(auth, browserLocalPersistence)`, so
  the user stays signed in after a refresh or after closing the browser.
- `signup`, `login`, `loginWithGoogle` (popup) and `logout` are in the context. On failure they
  throw an `Error` with a readable message (e.g. `auth/invalid-credential` → "Wrong email or
  password."), and the page shows it.
- After a successful login or signup the page does not navigate by itself: `onAuthStateChanged`
  sets `user`, and the page renders `<Navigate to="/profile">`.
- `/profile` is wrapped in `ProtectedRoute`: without a user it redirects to `/login`. After
  **Log out** the same check sends the user to `/login`.
- The NavBar shows **Log in / Sign up** for guests and **Profile / Log out** for signed-in users.

## Caching strategy

The cache is a small custom service (`services/cache.js`) for the crew API. It is an in-memory
`Map` from a **key** to `{ promise, savedAt }`.

**Keys.** Every key starts with `crew:` and contains everything the request depends on:

| Request | Key |
| --- | --- |
| Crew list page | `crew:list?search=…&department=…&status=…&sort=…&page=…&limit=6` |
| Dashboard (all crew of a department) | `crew:list?department=Science&page=1&limit=1000` |
| One crew member | `crew:member:5` |

So every combination of filters, sort and page is stored separately, and coming back to a view you
have seen shows it at once without a request.

**Expiration.** An entry is valid for **60 seconds**. After that the next read sends a new request
and saves the new answer.

**When the cache is cleared (invalidated)** — all `crew:` entries are removed:

- after **create** (New member), **update** (Edit, Report for duty / Stand down) and **delete**
  (Remove), because one change can affect any list, the dashboard and the member page;
- after **Reset data** in the footer;
- when you press **Reload** on the crew list or the dashboard (it should really go to the server).

Failed requests are never cached, so **Try again** always sends a new request.

**Outdated requests.** The Promise is stored, not the data. Two pages asking for the same key at
the same time share one request, and a request that started before the cache was cleared cannot
write old data back into it. In the pages, each request effect still has its own
`let ignore = false` (set to `true` in the cleanup), so an answer that arrives after the user moved
to another filter, page or member is dropped and shown as *Ignored (stale)* in the request log.

**Loading, error, empty states** are the same as in Task 05: skeletons, dimmed old results while
refreshing, an error message with **Try again**, "the roster is empty" and "no matches" with
**Clear filters**.

## Try it

1. Open the crew list, go to page 2, then back to page 1. Page 1 appears at once, and the request
   log shows it took 0.0 s (from the cache).
2. Open a member, press **Stand down**, go back to the list: the list is loaded again and shows the
   new status.
3. Sign up with a new email, refresh the page: you are still signed in. Open `/profile`.
4. Log out, then open `/profile` directly: you are sent to `/login`.
5. Log in with Google.

## Deployment

Built and published by `.github/workflows/deploy.yml` at the repo root together with the other
tasks. `.env.local` is not in git, so the workflow passes the Firebase config to `npm run build`
from GitHub repository secrets with the same names as in `.env.example`
(**Settings → Secrets and variables → Actions**).

GitHub Pages serves one `404.html` for the whole site. The workflow copies `gh-pages-404.html`
there; for paths under `/react-task-05/`, `/react-task-06/`, `/react-task-07/` and `/react-task-08/` it redirects back to
the app, so deep links like `/react-task-08/profile` survive a refresh.
