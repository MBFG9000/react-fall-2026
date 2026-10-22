// Thin layer on top of the unmodified fakeApi.js.
// Components import requests from here and never touch localStorage themselves.
import { createItem, deleteItem, getItem, getItemsList, updateItem } from './fakeApi.js';
import { API_CONFIG, DATA_KEY } from './settings.js';
import { initialDataSample } from './initial-data-sample.js';

export { getItem, getItemsList, updateItem, deleteItem };

// fakeApi's createItem only stores `name` and `description`, and the API must
// not be modified. So a full create is two requests: POST the base item, then
// PATCH the remaining fields onto it. If the PATCH fails, the half-created item
// is deleted again so the list never shows a crew member with missing fields.
export async function createCrewMember(data) {
    const { name, description, ...rest } = data;
    const created = await createItem({ name, description });
    try {
        return await updateItem(created.id, rest);
    } catch (error) {
        await deleteItem(created.id).catch(() => {});
        throw error;
    }
}

// Restores the seed data. This is the "backend" side, so it may use localStorage.
export function resetDatabase() {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialDataSample));
}

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
