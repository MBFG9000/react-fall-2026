import { useSelector } from 'react-redux';
import { selectCrewStats } from '../features/crew/crewSelectors.js';
import { buildAllCrewQuery } from '../services/crewApi.js';
import { useCrewList } from './useCrewList.js';
import { useLastValue } from './useLastValue.js';

/**
 * Dashboard data: every crew member of `department` ('' = whole ship), turned
 * into statistics by the memoized selectCrewStats.
 * Returns { stats, status, error, reload }.
 */
export function useCrewStats(department) {
    const query = buildAllCrewQuery(department);
    const { status, error, reload } = useCrewList(query);
    const stats = useLastValue(useSelector((state) => selectCrewStats(state, query)));
    return { stats, status, error, reload };
}
