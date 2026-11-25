import { createAsyncThunk } from '@reduxjs/toolkit';
import { getArticle, getArticles } from '../../services/newsApi.js';
import { toErrorPayload } from '../../store/runRequest.js';

// A saved page can be shown again without a request, unless it came from the
// Service Worker's offline copy: then the next visit tries the network again.
function isFresh(entry) {
    return entry?.status === 'success' && !entry.fromCache;
}

/** One page of the news list: payload `{ data: { count, results }, fromCache, cachedAt }`. */
export const fetchNewsPage = createAsyncThunk(
    'news/fetchPage',
    async ({ page }, { signal, rejectWithValue }) => {
        try {
            return await getArticles(page, signal);
        } catch (error) {
            return rejectWithValue(toErrorPayload(error));
        }
    },
    { condition: ({ page, force }, { getState }) => force || !isFresh(getState().news.pages[page]) },
);

/** One article: payload `{ data: article, fromCache, cachedAt }`. */
export const fetchNewsArticle = createAsyncThunk(
    'news/fetchArticle',
    async ({ id }, { signal, rejectWithValue }) => {
        try {
            return await getArticle(id, signal);
        } catch (error) {
            return rejectWithValue(toErrorPayload(error));
        }
    },
    { condition: ({ id, force }, { getState }) => force || !isFresh(getState().news.details[id]) },
);
