/* eslint-disable no-restricted-globals */
// Service Worker of Meridian Crew.
//
// This file is a template: the `serviceWorker()` plugin in vite.config.js
// fills in the placeholders at build time and writes the result to dist/sw.js.
// It is not imported by the app and does not run in `npm run dev`.

const VERSION = '__VERSION__'; // hash of the build: changes with every new deploy
const BASE = '__BASE__'; // base path of the app, ends with a slash
const PRECACHE_URLS = __PRECACHE_URLS__; // index page, JS/CSS chunks, icons, manifest

// Cache names. The origin (mbfg9000.github.io) is shared with other tasks,
// so every name starts with a prefix only this app uses.
const PREFIX = 'react-task-08';
const PRECACHE = `${PREFIX}-precache-${VERSION}`; // app shell, replaced by every deploy
const STATIC_CACHE = `${PREFIX}-static-v1`; // images, fonts (cache-first)
const API_CACHE = `${PREFIX}-api-v1`; // public news API (network-first)
const PAGES_CACHE = `${PREFIX}-pages-v1`; // which app paths were visited
const CURRENT_CACHES = [PRECACHE, STATIC_CACHE, API_CACHE, PAGES_CACHE];

// Maximum number of entries per runtime cache. The oldest entries are removed first.
const MAX_ENTRIES = {
    [STATIC_CACHE]: 60,
    [API_CACHE]: 50,
    [PAGES_CACHE]: 50,
};

// The only API the Service Worker caches. It is public: no tokens, no user data.
const API_ORIGIN = 'https://api.spaceflightnewsapi.net';

// ---------- Lifecycle ----------

self.addEventListener('install', (event) => {
    // `cache: 'reload'` skips the browser HTTP cache, so a new version never
    // pre-caches a stale index.html that still points to the old JS files.
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })))),
    );
    // No skipWaiting() here: if an older version is running, the new one waits
    // until the user presses "Update" in the banner (see the message handler).
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // Remove caches of older versions (old precache with old JS chunks, old runtime caches).
            const names = await caches.keys();
            await Promise.all(
                names
                    .filter((name) => name.startsWith(PREFIX) && !CURRENT_CACHES.includes(name))
                    .map((name) => caches.delete(name)),
            );
            // Take control of already open tabs without a reload.
            await self.clients.claim();
        })(),
    );
});

self.addEventListener('message', (event) => {
    const message = event.data ?? {};
    if (message.type === 'SKIP_WAITING') {
        // The user pressed "Update": activate the waiting version now.
        self.skipWaiting();
    }
    if (message.type === 'PAGE_VISITED' && typeof message.path === 'string') {
        // The app reports every route it shows, so the page can be opened offline later.
        event.waitUntil(rememberPage(message.path));
    }
});

// ---------- Fetch routing ----------

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return; // POST/PATCH/... always go to the network

    const url = new URL(request.url);

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request, event));
        return;
    }

    if (url.origin === API_ORIGIN) {
        event.respondWith(networkFirst(request, event));
        return;
    }

    const isOwnFile = url.origin === self.location.origin && url.pathname.startsWith(BASE);
    const isStaticAsset = ['image', 'font', 'style'].includes(request.destination);
    if (isOwnFile || isStaticAsset) {
        event.respondWith(cacheFirst(request, event));
        return;
    }

    // Everything else is not touched: Firebase Authentication, Google sign-in,
    // token refreshes and any private data go straight to the network and are
    // never stored in a cache.
});

// ---------- Strategies ----------

// Cache-first: static files (pre-cached app shell, icons, images, fonts).
async function cacheFirst(request, event) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        // Opaque = cross-origin image or stylesheet without CORS; it is still usable.
        if (response.ok || response.type === 'opaque') {
            event.waitUntil(putAndTrim(STATIC_CACHE, request, response.clone()));
        }
        return response;
    } catch {
        return new Response('', { status: 504, statusText: 'Offline' });
    }
}

// Network-first: public API list and details. Fresh data when online,
// the last saved copy when offline.
async function networkFirst(request, event) {
    try {
        // 'no-cache': always ask the server (the API sends max-age=600, so the
        // browser HTTP cache would otherwise answer offline and hide that the data is old).
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok) {
            event.waitUntil(putAndTrim(API_CACHE, request, await withCachedAt(response.clone())));
        }
        return response;
    } catch {
        const cached = await caches.match(request, { cacheName: API_CACHE });
        if (cached) return markFromCache(cached);
        // Offline and never fetched before: a JSON answer instead of a network error,
        // so the app can tell "offline, not cached" apart from a broken API.
        return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'X-Offline': 'true' },
        });
    }
}

// Navigations (typing a URL, refresh, opening the installed app).
// Network-first; offline it serves the pre-cached app shell for pages that were
// visited before, and the /offline page for everything else.
async function handleNavigation(request, event) {
    const url = new URL(request.url);
    const path = appPath(url);

    try {
        const response = await fetch(request);
        if (response.ok) event.waitUntil(rememberPage(path));
        return response;
    } catch {
        const shell = await caches.match(BASE, { cacheName: PRECACHE });
        const pages = await caches.open(PAGES_CACHE);
        const canOpen = path === '/' || path === '/offline' || (await pages.match(path));

        if (shell && canOpen) return shell;

        // The React app has an /offline route; it is part of the pre-cached shell.
        const offlineUrl = new URL(`${BASE}offline`, self.location.origin);
        offlineUrl.searchParams.set('from', path + stripSpa(url.search));
        return Response.redirect(offlineUrl.href, 302);
    }
}

// ---------- Helpers ----------

// The route of the app for a URL, without the base path: "/crew/3".
// GitHub Pages deep links arrive as "?__spa=/crew/3" (see gh-pages-404.html).
function appPath(url) {
    const spa = url.searchParams.get('__spa');
    if (spa !== null) return spa.split('?')[0] || '/';
    return '/' + url.pathname.slice(BASE.length);
}

function stripSpa(search) {
    const params = new URLSearchParams(search);
    if (params.has('__spa')) {
        const query = params.get('__spa').split('?')[1];
        return query ? `?${query}` : '';
    }
    return search;
}

function rememberPage(path) {
    return putAndTrim(PAGES_CACHE, path, new Response(''));
}

async function putAndTrim(cacheName, request, response) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    const keys = await cache.keys(); // oldest first
    const extra = keys.length - MAX_ENTRIES[cacheName];
    for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

// Stores the time of saving inside the cached copy (a CORS response hides its Date header).
async function withCachedAt(response) {
    const headers = new Headers(response.headers);
    headers.set('X-Cached-At', new Date().toISOString());
    return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers });
}

// Adds a header so the app can show "you are viewing cached data".
function markFromCache(response) {
    const headers = new Headers(response.headers);
    headers.set('X-From-Cache', 'true');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
