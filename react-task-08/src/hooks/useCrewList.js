import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrewList } from '../features/crew/crewThunks.js';
import { selectCrewListEntry, selectCrewListResult, selectCrewVersion } from '../features/crew/crewSelectors.js';
import { useLastValue } from './useLastValue.js';

/**
 * Loads one page of the roster for `query` (from buildCrewQuery) and returns
 * { result, status, error, reload }.
 *
 * - The request starts when the query changes and after any change to the
 *   crew (`version`). If the store already has fresh data, the thunk's
 *   `condition` skips the request.
 * - The cleanup aborts the request: when the query changes again before the
 *   answer comes, the old answer is ignored (logged as "Ignored (stale)").
 * - `result` stays on the previous results while new ones load.
 */
export function useCrewList(query) {
    const dispatch = useDispatch();
    const version = useSelector(selectCrewVersion);
    const entry = useSelector((state) => selectCrewListEntry(state, query));
    const result = useLastValue(useSelector((state) => selectCrewListResult(state, query)));

    useEffect(() => {
        const request = dispatch(fetchCrewList({ query }));
        return () => request.abort();
    }, [dispatch, query, version]);

    // No entry yet (first render, before the effect) means a request is about to start.
    const status = !entry || entry.status === 'idle' ? 'loading' : entry.status;

    return {
        result,
        status,
        error: entry?.error ?? null,
        // Reload / Try again: always go to the server.
        reload: () => dispatch(fetchCrewList({ query, force: true })),
    };
}
