import { createSelector } from '@reduxjs/toolkit';
import { NEWS_PAGE_SIZE } from '../../services/newsApi.js';
import { articlesAdapter } from './newsSlice.js';

// The API has ~37 000 articles; showing the first 20 pages is plenty.
export const MAX_NEWS_PAGES = 20;

const adapterSelectors = articlesAdapter.getSelectors((state) => state.news);

export const selectArticleEntities = adapterSelectors.selectEntities;
export const selectArticleById = adapterSelectors.selectById; // (state, id)

/** Request state of one list page: (state, page) => entry | undefined */
export const selectNewsPageEntry = (state, page) => state.news.pages[page];

/** Request state of one article: (state, id) => entry | undefined */
export const selectArticleEntry = (state, id) => state.news.details[id];

/**
 * Memoized: ids of the page -> articles, plus the number of pages.
 * (state, page) => { articles, count, totalPages, fromCache, cachedAt } | null
 */
export const selectNewsPageResult = createSelector(
    [selectNewsPageEntry, selectArticleEntities],
    (entry, entities) => {
        if (!entry?.ids) return null;
        return {
            articles: entry.ids.map((id) => entities[id]).filter(Boolean),
            count: entry.count,
            totalPages: Math.min(MAX_NEWS_PAGES, Math.ceil(entry.count / NEWS_PAGE_SIZE)),
            fromCache: entry.fromCache,
            cachedAt: entry.cachedAt,
        };
    },
);
