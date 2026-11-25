import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
    createCrewMember,
    deleteCrewMember,
    fetchCrewList,
    fetchCrewMember,
    resetCrewData,
    updateCrewMember,
} from './crewThunks.js';

// Crew members are stored once, by id (`ids` + `entities`, made by the entity
// adapter). Lists and the details page only keep ids and point into it, so the
// same member is never stored twice, and an edit shows up everywhere at once.
export const crewAdapter = createEntityAdapter();

const initialState = crewAdapter.getInitialState({
    // Goes up by one after every change to the data (create, update, delete,
    // reset). Each list / details entry remembers the version it was loaded at;
    // an older entry is outdated and is loaded again when a page needs it.
    version: 0,

    // One entry per query string, e.g. "?department=Science&sort=name&page=1&limit=6":
    // { ids, total, page, totalPages, status, error, version, requestId, requestVersion }
    lists: {},

    // One entry per crew id: { status, error, version, requestId, requestVersion }
    details: {},

    // Mutations in flight: { [id]: 'save' | 'status' | 'delete' }
    pendingById: {},
});

// status: 'idle' | 'loading' | 'success' | 'error' (+ 'not-found' for details)

/** pending: remember which request is the newest one for this entry. */
function startRequest(state, entry, action) {
    entry.status = 'loading';
    entry.error = null;
    entry.requestId = action.meta.requestId;
    entry.requestVersion = state.version; // the data this request returns belongs to this version
}

/** Only the newest request of an entry may change it. Older answers are stale. */
function isCurrentRequest(entry, action) {
    return Boolean(entry) && entry.requestId === action.meta.requestId;
}

/** rejected: aborted (page left) keeps the old data; anything else is an error. */
function failRequest(entry, action) {
    entry.requestId = null;
    if (action.meta.aborted) {
        entry.status = entry.ids ? 'success' : 'idle';
        return;
    }
    entry.status = 'error';
    entry.error = action.payload ?? { message: action.error.message };
}

/** After a mutation the server's answer is the newest data: no need to fetch it again. */
function markDetailsFresh(state, id, status) {
    state.details[id] = { status, error: null, version: state.version, requestId: null };
}

const crewSlice = createSlice({
    name: 'crew',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ----- List -----
            .addCase(fetchCrewList.pending, (state, action) => {
                const { query } = action.meta.arg;
                state.lists[query] ??= { ids: null, total: 0, page: 1, totalPages: 0, version: -1 };
                startRequest(state, state.lists[query], action);
            })
            .addCase(fetchCrewList.fulfilled, (state, action) => {
                const entry = state.lists[action.meta.arg.query];
                if (!isCurrentRequest(entry, action)) return;
                const { data, total, page, totalPages } = action.payload;
                crewAdapter.upsertMany(state, data);
                Object.assign(entry, {
                    ids: data.map((member) => member.id),
                    total,
                    page,
                    totalPages,
                    status: 'success',
                    version: entry.requestVersion,
                    requestId: null,
                });
            })
            .addCase(fetchCrewList.rejected, (state, action) => {
                const entry = state.lists[action.meta.arg.query];
                if (isCurrentRequest(entry, action)) failRequest(entry, action);
            })

            // ----- Details -----
            .addCase(fetchCrewMember.pending, (state, action) => {
                const { id } = action.meta.arg;
                state.details[id] ??= { version: -1 };
                startRequest(state, state.details[id], action);
            })
            .addCase(fetchCrewMember.fulfilled, (state, action) => {
                const entry = state.details[action.meta.arg.id];
                if (!isCurrentRequest(entry, action)) return;
                crewAdapter.upsertOne(state, action.payload);
                Object.assign(entry, { status: 'success', version: entry.requestVersion, requestId: null });
            })
            .addCase(fetchCrewMember.rejected, (state, action) => {
                const { id } = action.meta.arg;
                const entry = state.details[id];
                if (!isCurrentRequest(entry, action)) return;
                if (action.payload?.notFound) {
                    // The member does not exist (any more): forget any copy of them.
                    crewAdapter.removeOne(state, id);
                    Object.assign(entry, { status: 'not-found', version: entry.requestVersion, requestId: null });
                    return;
                }
                failRequest(entry, action);
            })

            // ----- Create -----
            .addCase(createCrewMember.fulfilled, (state, action) => {
                crewAdapter.upsertOne(state, action.payload);
                state.version += 1;
                markDetailsFresh(state, action.payload.id, 'success');
            })

            // ----- Update (edit, duty status) -----
            .addCase(updateCrewMember.pending, (state, action) => {
                state.pendingById[action.meta.arg.id] = action.meta.arg.action ?? 'save';
            })
            .addCase(updateCrewMember.fulfilled, (state, action) => {
                delete state.pendingById[action.meta.arg.id];
                crewAdapter.upsertOne(state, action.payload);
                state.version += 1;
                markDetailsFresh(state, action.payload.id, 'success');
            })
            .addCase(updateCrewMember.rejected, (state, action) => {
                delete state.pendingById[action.meta.arg.id];
            })

            // ----- Delete -----
            .addCase(deleteCrewMember.pending, (state, action) => {
                state.pendingById[action.meta.arg.id] = 'delete';
            })
            .addCase(deleteCrewMember.fulfilled, (state, action) => {
                const { id } = action.meta.arg;
                delete state.pendingById[id];
                crewAdapter.removeOne(state, id);
                state.version += 1;
                // Known to be gone: opening /crew/<id> again shows "not found" without a request.
                markDetailsFresh(state, id, 'not-found');
            })
            .addCase(deleteCrewMember.rejected, (state, action) => {
                delete state.pendingById[action.meta.arg.id];
            })

            // ----- Reset data -----
            .addCase(resetCrewData.fulfilled, (state) => {
                state.version += 1;
            });
    },
});

export default crewSlice.reducer;
