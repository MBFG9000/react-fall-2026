import { SORTS } from '../constants.js';

export default function Toolbar({ search, onSearchChange, sort, onSortChange, isLoading, onReload, onCreate }) {
    return (
        <div className="toolbar">
            <label className="field toolbar__search">
                <span className="sr-only">Search crew</span>
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name or role…"
                />
            </label>

            <label className="field">
                <span className="sr-only">Sort</span>
                <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
                    {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </label>

            <button type="button" className="btn btn--ghost" onClick={onReload} title="Fetch the list again">
                <svg className={`icon ${isLoading ? 'icon--spin' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" />
                </svg>
                Reload
            </button>

            <button type="button" className="btn btn--primary" onClick={onCreate}>
                + New member
            </button>
        </div>
    );
}
