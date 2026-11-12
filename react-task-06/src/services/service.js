// All API requests of the app live here (same idea as crewApi.js in Task 04).
// Pages call these functions and never touch fakeApi.js or localStorage directly.
import { createItem, deleteItem, getItem, getItemsList, updateItem } from '../api/fakeApi.js';
import { API_CONFIG, DATA_KEY } from '../api/settings.js';
import { initialDataSample } from '../api/initial-data-sample.js';
import { cachedRequest, invalidateCache } from './cache.js';

// Every crew cache key starts with this, e.g. "crew:list?page=1&limit=6" or "crew:member:5".
const CREW_KEY = 'crew:';

/** Forget all cached crew data (used by the Reload buttons and after every change). */
export function clearCrewCache() {
    invalidateCache(CREW_KEY);
}

// ---------- Queries (cached) ----------

/**
 * Builds the query string the fake API understands. Empty values are left
 * out, so `{ search: '', page: 2, limit: 6 }` becomes `?page=2&limit=6`.
 */
export function buildCrewQuery({ search, department, status, sort, page, limit }) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (department) params.set('department', department);
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return `?${params}`;
}

/** One page of crew: `{ data, total, page, limit, totalPages }`. Filtering happens in the API. */
export function getCrewList(query) {
    return cachedRequest(`${CREW_KEY}list${query}`, () => getItemsList(query));
}

// The fake API has no "give me everything" option, so the dashboard asks for
// one page that is big enough to hold the whole roster.
const ALL_LIMIT = 1000;

/** Every crew member of a department ('' = all departments), filtered by the API. */
export function getAllCrew(department) {
    const query = buildCrewQuery({ department, page: 1, limit: ALL_LIMIT });
    return getCrewList(query).then((result) => result.data);
}

export function getCrewMember(id) {
    return cachedRequest(`${CREW_KEY}member:${id}`, () => getItem(id));
}

/** fakeApi rejects with Error("Item not found") when the id does not exist. */
export function isNotFoundError(error) {
    return error?.message === 'Item not found';
}

// ---------- Mutations ----------
// A change can affect every cached list, the dashboard and the member itself,
// so after each one the whole crew cache is cleared.

export async function updateCrewMember(id, changes) {
    const updated = await updateItem(id, { ...changes, updatedAt: new Date().toISOString() });
    clearCrewCache();
    return updated;
}

export async function deleteCrewMember(id) {
    const result = await deleteItem(id);
    clearCrewCache();
    return result;
}

// fakeApi's createItem only stores `name` and `description`, and the API must
// not be modified. So a full create is two requests: POST the base item, then
// PATCH the remaining fields onto it. If the PATCH fails, the half-created item
// is deleted again so the list never shows a crew member with missing fields.
export async function createCrewMember(data) {
    const { name, description, ...rest } = data;
    const created = await createItem({ name, description });
    try {
        return await updateItem(created.id, { ...rest, updatedAt: new Date().toISOString() });
    } catch (error) {
        await deleteItem(created.id).catch(() => {});
        throw error;
    } finally {
        clearCrewCache();
    }
}

// Restores the seed data. This is the "backend" side, so it may use localStorage.
export function resetDatabase() {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialDataSample));
    clearCrewCache();
}

// ---------- Network simulation ----------

export const NETWORK_PRESETS = {
    normal: { label: 'Normal (0.5–3 s, 5% errors)', minDelay: 500, maxDelay: 3000, errorChance: 0.05 },
    racy: { label: 'Race demo (0.2–4 s, no errors)', minDelay: 200, maxDelay: 4000, errorChance: 0 },
    flaky: { label: 'Flaky (0.5–2 s, 35% errors)', minDelay: 500, maxDelay: 2000, errorChance: 0.35 },
    fast: { label: 'Fast (0.1–0.3 s, no errors)', minDelay: 100, maxDelay: 300, errorChance: 0 },
};

// fakeRequest reads API_CONFIG at call time, so changing it affects every
// request started after this call.
export function applyNetworkPreset(key) {
    const { minDelay, maxDelay, errorChance } = NETWORK_PRESETS[key];
    Object.assign(API_CONFIG, { minDelay, maxDelay, errorChance });
}
