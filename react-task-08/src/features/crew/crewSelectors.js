import { createSelector } from '@reduxjs/toolkit';
import { computeCrewStats } from '../../utils/crewStats.js';
import { crewAdapter } from './crewSlice.js';

// Reusable selectors for the crew feature. Components and hooks read the
// store only through these, so the shape of the state is known in one place.

// selectById, selectEntities, ... made by the entity adapter.
const adapterSelectors = crewAdapter.getSelectors((state) => state.crew);

export const selectCrewEntities = adapterSelectors.selectEntities;
export const selectCrewMemberById = adapterSelectors.selectById; // (state, id)

/** Goes up after every change to the crew. Hooks load their data again when it changes. */
export const selectCrewVersion = (state) => state.crew.version;

/** Request state of one list: (state, query) => entry | undefined */
export const selectCrewListEntry = (state, query) => state.crew.lists[query];

/** Request state of one details page: (state, id) => entry | undefined */
export const selectCrewDetailsEntry = (state, id) => state.crew.details[id];

/** 'save' | 'status' | 'delete' while a change to this member is running, otherwise undefined. */
export const selectPendingAction = (state, id) => state.crew.pendingById[id];

/**
 * Memoized: the list stores only ids, so this turns them into crew members.
 * It returns the same object until the list or the members change, so
 * components using it do not re-render for nothing.
 * (state, query) => { members, total, page, totalPages } | null
 */
export const selectCrewListResult = createSelector(
    [selectCrewListEntry, selectCrewEntities],
    (entry, entities) => {
        if (!entry?.ids) return null;
        return {
            // .filter(Boolean): a member deleted meanwhile is skipped until the list reloads.
            members: entry.ids.map((id) => entities[id]).filter(Boolean),
            total: entry.total,
            page: entry.page,
            totalPages: entry.totalPages,
        };
    },
);

/**
 * Memoized: dashboard statistics are calculated only when the list behind
 * them changes, not on every render.
 * (state, query) => stats | null
 */
export const selectCrewStats = createSelector([selectCrewListResult], (result) =>
    result ? computeCrewStats(result.members) : null,
);
