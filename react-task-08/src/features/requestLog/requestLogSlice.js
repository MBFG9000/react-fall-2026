import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit';

// The request log in the footer: one row per finished crew request, newest first.
// The crew thunks add rows themselves (see store/runRequest.js), so pages do
// not have to log anything.
//
// outcome: 'ok' | 'error' | 'stale'
const MAX_ENTRIES = 40;

const requestLogSlice = createSlice({
    name: 'requestLog',
    initialState: { entries: [] },
    reducers: {
        requestLogged: {
            reducer(state, action) {
                state.entries.unshift(action.payload);
                state.entries.splice(MAX_ENTRIES);
            },
            // Reducers must be pure, so the id and the duration are made here,
            // in `prepare`, before the action reaches the reducer.
            prepare(label, outcome, startedAt) {
                return { payload: { id: nanoid(), label, outcome, ms: Date.now() - startedAt } };
            },
        },
        requestLogCleared(state) {
            state.entries = [];
        },
    },
});

export const { requestLogged, requestLogCleared } = requestLogSlice.actions;
export default requestLogSlice.reducer;

// ---------- Selectors ----------

export const selectLogEntries = (state) => state.requestLog.entries;

/** Memoized: counted again only when the entries change. */
export const selectStaleCount = createSelector(
    [selectLogEntries],
    (entries) => entries.filter((entry) => entry.outcome === 'stale').length,
);
