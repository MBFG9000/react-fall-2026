// Public Spaceflight News API (no key, no user data). Unlike the crew API, these
// are real network requests, so the Service Worker caches them (network-first)
// and they stay readable offline. See src/pwa/sw.js.
const API_URL = 'https://api.spaceflightnewsapi.net/v4/articles/';

export const NEWS_PAGE_SIZE = 12;

/**
 * Fetches JSON and reports where it came from:
 * `{ data, fromCache, cachedAt }`. `fromCache` is true when the Service Worker
 * answered with a saved copy because the network was not available.
 * Throws an Error; `error.offline` is true when we are offline and the page was never cached.
 */
async function request(url) {
    let response;
    try {
        response = await fetch(url);
    } catch {
        // Without a Service Worker (dev mode) an offline fetch just fails.
        const error = new Error('Network error. Check your connection.');
        error.offline = !navigator.onLine;
        throw error;
    }

    if (response.headers.get('X-Offline') === 'true') {
        const error = new Error('You are offline and this page was not saved yet.');
        error.offline = true;
        throw error;
    }
    if (response.status === 404) {
        const error = new Error('Article not found.');
        error.notFound = true;
        throw error;
    }
    if (!response.ok) {
        throw new Error(`The news server answered with ${response.status}.`);
    }

    return {
        data: await response.json(),
        fromCache: response.headers.get('X-From-Cache') === 'true',
        cachedAt: response.headers.get('X-Cached-At'),
    };
}

/** One page of articles: `data` is `{ count, results }`. */
export function getArticles(page) {
    const offset = (page - 1) * NEWS_PAGE_SIZE;
    return request(`${API_URL}?limit=${NEWS_PAGE_SIZE}&offset=${offset}`);
}

export function getArticle(id) {
    return request(`${API_URL}${encodeURIComponent(id)}/`);
}
