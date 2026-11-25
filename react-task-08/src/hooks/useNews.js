import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { selectArticleById, selectArticleEntry, selectNewsPageEntry, selectNewsPageResult } from '../features/news/newsSelectors.js';
import { fetchNewsArticle, fetchNewsPage } from '../features/news/newsThunks.js';

// Offline and this page was never saved by the Service Worker: open /offline.
// Aborted requests (page left) have no payload, so they never redirect.
function redirectIfOffline(action, navigate, from) {
    if (action.payload?.offline) {
        navigate(`/offline?from=${encodeURIComponent(from)}`, { replace: true });
    }
}

function toStatus(entry) {
    return !entry || entry.status === 'idle' ? 'loading' : entry.status;
}

/** One page of the news list. Returns { result, status, error, retry }. */
export function useNewsPage(page) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const entry = useSelector((state) => selectNewsPageEntry(state, page));
    const result = useSelector((state) => selectNewsPageResult(state, page));
    const from = `/news?page=${page}`;

    useEffect(() => {
        const request = dispatch(fetchNewsPage({ page }));
        request.then((action) => redirectIfOffline(action, navigate, from));
        return () => request.abort();
    }, [dispatch, navigate, page, from]);

    return {
        result,
        status: toStatus(entry),
        error: entry?.error ?? null,
        retry: () => dispatch(fetchNewsPage({ page, force: true })).then((action) => redirectIfOffline(action, navigate, from)),
    };
}

/**
 * One article. If the list was opened before, the article is already in the
 * store and shown at once; the details request still runs, so the Service
 * Worker saves the article page for offline reading.
 * Returns { article, fromCache, cachedAt, status, error, retry }.
 */
export function useNewsArticle(id) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const entry = useSelector((state) => selectArticleEntry(state, id));
    const article = useSelector((state) => selectArticleById(state, id));
    const from = `/news/${id}`;

    useEffect(() => {
        const request = dispatch(fetchNewsArticle({ id }));
        request.then((action) => redirectIfOffline(action, navigate, from));
        return () => request.abort();
    }, [dispatch, navigate, id, from]);

    return {
        article: article ?? null,
        fromCache: Boolean(entry?.fromCache),
        cachedAt: entry?.cachedAt ?? null,
        status: toStatus(entry),
        error: entry?.error ?? null,
        retry: () => dispatch(fetchNewsArticle({ id, force: true })).then((action) => redirectIfOffline(action, navigate, from)),
    };
}
