import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrewMember } from '../features/crew/crewThunks.js';
import {
    selectCrewDetailsEntry,
    selectCrewMemberById,
    selectCrewVersion,
    selectPendingAction,
} from '../features/crew/crewSelectors.js';

/**
 * Loads one crew member for the details page (`id` is a number, or null for
 * an invalid URL). Returns { member, status, error, pendingAction, retry }.
 *
 * The member may already be in the store from the roster list; then it is
 * shown at once while the full record is requested.
 */
export function useCrewMember(id) {
    const dispatch = useDispatch();
    const version = useSelector(selectCrewVersion);
    const entry = useSelector((state) => selectCrewDetailsEntry(state, id));
    const member = useSelector((state) => selectCrewMemberById(state, id));
    const pendingAction = useSelector((state) => selectPendingAction(state, id));

    useEffect(() => {
        if (id === null) return; // invalid id: nothing to load
        const request = dispatch(fetchCrewMember({ id }));
        // Opening another member (or leaving) before the answer comes makes it stale.
        return () => request.abort();
    }, [dispatch, id, version]);

    const status = !entry || entry.status === 'idle' ? 'loading' : entry.status;

    return {
        member: member ?? null,
        status, // 'loading' | 'success' | 'not-found' | 'error'
        error: entry?.error ?? null,
        pendingAction: pendingAction ?? null, // 'save' | 'status' | 'delete' | null
        retry: () => dispatch(fetchCrewMember({ id, force: true })),
    };
}
