import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { fetchNewsArticle, fetchNewsPage } from './newsThunks.js';

// Articles are stored once by id. A list page keeps only their ids, so an
// article opened from the list is shown at once while its own request runs.
export const articlesAdapter = createEntityAdapter();

const initialState = articlesAdapter.getInitialState({
    // page number -> { ids, count, loaded, status, error, fromCache, cachedAt, requestId }
    pages: {},
    // article id (from the URL) -> { loaded, status, error, fromCache, cachedAt, requestId }
    details: {},
});

// status: 'idle' | 'loading' | 'success' | 'error'

function startRequest(entry, action) {
    entry.status = 'loading';
    entry.error = null;
    entry.requestId = action.meta.requestId;
}

function finishRequest(entry, action) {
    Object.assign(entry, {
        status: 'success',
        loaded: true, // there is data to show from now on
        // true when the Service Worker answered with its saved copy (offline)
        fromCache: action.payload.fromCache,
        cachedAt: action.payload.cachedAt,
        requestId: null,
    });
}

function failRequest(entry, action) {
    entry.requestId = null;
    if (action.meta.aborted) {
        // The page was left before the answer came: keep what we had.
        entry.status = entry.loaded ? 'success' : 'idle';
        return;
    }
    entry.status = 'error';
    entry.error = action.payload ?? { message: action.error.message };
}

const isCurrentRequest = (entry, action) => Boolean(entry) && entry.requestId === action.meta.requestId;

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNewsPage.pending, (state, action) => {
                const { page } = action.meta.arg;
                state.pages[page] ??= { ids: null, count: 0 };
                startRequest(state.pages[page], action);
            })
            .addCase(fetchNewsPage.fulfilled, (state, action) => {
                const entry = state.pages[action.meta.arg.page];
                if (!isCurrentRequest(entry, action)) return;
                const { count, results } = action.payload.data;
                articlesAdapter.upsertMany(state, results);
                entry.ids = results.map((article) => article.id);
                entry.count = count;
                finishRequest(entry, action);
            })
            .addCase(fetchNewsPage.rejected, (state, action) => {
                const entry = state.pages[action.meta.arg.page];
                if (isCurrentRequest(entry, action)) failRequest(entry, action);
            })

            .addCase(fetchNewsArticle.pending, (state, action) => {
                const { id } = action.meta.arg;
                state.details[id] ??= {};
                startRequest(state.details[id], action);
            })
            .addCase(fetchNewsArticle.fulfilled, (state, action) => {
                const entry = state.details[action.meta.arg.id];
                if (!isCurrentRequest(entry, action)) return;
                articlesAdapter.upsertOne(state, action.payload.data);
                finishRequest(entry, action);
            })
            .addCase(fetchNewsArticle.rejected, (state, action) => {
                const entry = state.details[action.meta.arg.id];
                if (isCurrentRequest(entry, action)) failRequest(entry, action);
            });
    },
});

export default newsSlice.reducer;
