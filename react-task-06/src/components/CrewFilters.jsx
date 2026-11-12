import { useEffect, useState } from 'react';
import { DEPARTMENTS, SORTS, STATUSES } from '../constants.js';

const SEARCH_DELAY = 350;

// Search + filters + sort. Every value comes from the URL (via props) and every
// change goes back to the URL; the page then loads the list from the server.
export default function CrewFilters({ filters, activeCount, onChange, onReset }) {
    // The text box needs its own state so typing stays instant while the URL
    // (and the request) is only updated once the user pauses.
    const [draft, setDraft] = useState(filters.search);
    const [syncedSearch, setSyncedSearch] = useState(filters.search);

    // The URL changed from outside (Back/Forward, a link, "Clear filters"):
    // show the new value in the box. Adjusting state during render like this is
    // what React recommends instead of an extra effect.
    if (filters.search !== syncedSearch) {
        setSyncedSearch(filters.search);
        setDraft(filters.search);
    }

    // Debounce: wait SEARCH_DELAY ms after the last keystroke, then put the text
    // into the URL. Every keystroke changes `draft`, so the cleanup cancels the
    // previous timer before a new one starts.
    useEffect(() => {
        if (draft === filters.search) return; // already in the URL
        const timer = setTimeout(() => {
            onChange({ search: draft }, { replace: true });
        }, SEARCH_DELAY);
        return () => clearTimeout(timer);
    }, [draft, filters.search, onChange]);

    return (
        <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="field filters__search">
                <span className="field__label">Search</span>
                <input
                    type="search"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Search by name or role…"
                />
            </label>

            <label className="field">
                <span className="field__label">Department</span>
                <select value={filters.department} onChange={(e) => onChange({ department: e.target.value })}>
                    <option value="">All departments</option>
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span className="field__label">Status</span>
                <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })}>
                    <option value="">Any status</option>
                    {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span className="field__label">Sort by</span>
                <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
                    {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </label>

            <div className="filters__reset">
                <button type="button" className="btn btn--ghost" disabled={activeCount === 0} onClick={onReset}>
                    Clear filters{activeCount > 0 ? ` (${activeCount})` : ''}
                </button>
            </div>
        </form>
    );
}
