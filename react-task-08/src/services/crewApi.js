// Every request to the crew API lives here. Only the Redux thunks
// (src/features/crew/crewThunks.js) call these functions; components never
// touch fakeApi.js or localStorage directly.
//
// There is no cache in this file any more: the Redux store keeps the answers
// (see crewSlice.js), and the thunks decide when a new request is needed.
import { createItem, deleteItem, getItem, getItemsList, updateItem } from '../api/fakeApi.js';
import { API_CONFIG, DATA_KEY } from '../api/settings.js';
import { initialDataSample } from '../api/initial-data-sample.js';

// ---------- Queries ----------

/**
 * Builds the query string the fake API understands. Empty values are left
 * out, so `{ search: '', page: 2, limit: 6 }` becomes `?page=2&limit=6`.
 * The same string is the key of the list in the Redux store.
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

// The fake API has no "give me everything" option, so the dashboard asks for
// one page that is big enough to hold the whole roster.
const ALL_LIMIT = 1000;

/** Query for every crew member of a department ('' = all departments). Used by the dashboard. */
export function buildAllCrewQuery(department) {
    return buildCrewQuery({ department, page: 1, limit: ALL_LIMIT });
}

/** One page of crew: `{ data, total, page, limit, totalPages }`. Filtering happens in the API. */
export function getCrewList(query) {
    return getItemsList(query);
}

/** One crew member. Rejects with `error.notFound = true` when the id does not exist. */
export async function getCrewMember(id) {
    try {
        return await getItem(id);
    } catch (error) {
        // fakeApi rejects with Error("Item not found") for an unknown id.
        if (error.message === 'Item not found') error.notFound = true;
        throw error;
    }
}

// ---------- Mutations ----------

export function updateCrewMember(id, changes) {
    return updateItem(id, { ...changes, updatedAt: new Date().toISOString() });
}

export function deleteCrewMember(id) {
    return deleteItem(id);
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
    }
}

// Restores the seed data. This is the "backend" side, so it may use localStorage.
export function resetDatabase() {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialDataSample));
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
