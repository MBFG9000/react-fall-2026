# Task 6 — Server Data, Caching & Firebase Authentication: Meridian Crew

The Task 05 app (routes, filters, pagination, dashboard) with three additions:

- a cache for API responses, cleared after every change to the data;
- environment variables for the Firebase config;
- Firebase Authentication: email/password and Google, with a protected `/profile` page.

Everything from Task 05 still works the same way.

**Live:** https://mbfg9000.github.io/react-fall-2026/react-task-06/

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
npm run build    # production build into dist/ (base /react-fall-2026/react-task-06/)
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
there; for paths under `/react-task-05/` and `/react-task-06/` it redirects back to the app, so
deep links like `/react-task-06/profile` survive a refresh.
