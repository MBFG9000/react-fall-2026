import { createAsyncThunk } from '@reduxjs/toolkit';
import * as crewApi from '../../services/crewApi.js';
import { runRequest } from '../../store/runRequest.js';

// Async operations of the crew feature. Each one calls the API service and
// lets crewSlice.js handle pending / fulfilled / rejected in extraReducers.

/**
 * Data in the store can be used without a new request when it was loaded
 * successfully after the last change to the crew (`version`, see crewSlice.js).
 */
function isFresh(entry, version) {
    return Boolean(entry) && entry.version === version && (entry.status === 'success' || entry.status === 'not-found');
}

// ---------- Queries ----------

/**
 * One page of the roster (also used by the dashboard with a large `limit`).
 * `query` is the string from buildCrewQuery(), and also the key in the store.
 * `force: true` (Reload / Try again) skips the "already in the store" check.
 */
export const fetchCrewList = createAsyncThunk(
    'crew/fetchList',
    ({ query }, thunkApi) =>
        runRequest(
            `GET /items${query}`,
            () => crewApi.getCrewList(query),
            thunkApi,
            // Reload may start a second request for the same query; only the newest one counts.
            () => thunkApi.getState().crew.lists[query]?.requestId === thunkApi.requestId,
        ),
    {
        // Returning false cancels the thunk before it starts: no request, no actions.
        condition: ({ query, force }, { getState }) => {
            const { lists, version } = getState().crew;
            return force || !isFresh(lists[query], version);
        },
    },
);

/** The full record of one crew member, for the details page. */
export const fetchCrewMember = createAsyncThunk(
    'crew/fetchMember',
    ({ id }, thunkApi) =>
        runRequest(
            `GET /items/${id}`,
            () => crewApi.getCrewMember(id),
            thunkApi,
            () => thunkApi.getState().crew.details[id]?.requestId === thunkApi.requestId,
        ),
    {
        condition: ({ id, force }, { getState }) => {
            const { details, version } = getState().crew;
            return force || !isFresh(details[id], version);
        },
    },
);

// ---------- Mutations ----------
// A change can affect every list, the dashboard and the member itself.
// crewSlice.js raises `version` after each one, and every page that shows
// crew data loads it again (see the hooks in src/hooks/).

export const createCrewMember = createAsyncThunk('crew/create', (data, thunkApi) =>
    runRequest('POST /items + PATCH fields', () => crewApi.createCrewMember(data), thunkApi),
);

/**
 * Edit a member or change their duty status.
 * `action` ('save' | 'status') only tells the UI which button shows "…ing".
 */
export const updateCrewMember = createAsyncThunk('crew/update', ({ id, changes, action }, thunkApi) =>
    runRequest(
        action === 'status' ? `PATCH /items/${id} status=${changes.status}` : `PATCH /items/${id}`,
        () => crewApi.updateCrewMember(id, changes),
        thunkApi,
    ),
);

export const deleteCrewMember = createAsyncThunk('crew/delete', ({ id }, thunkApi) =>
    runRequest(`DELETE /items/${id}`, () => crewApi.deleteCrewMember(id), thunkApi),
);

/** "Reset data" in the footer: restores the seed crew. */
export const resetCrewData = createAsyncThunk('crew/reset', () => {
    crewApi.resetDatabase();
});
