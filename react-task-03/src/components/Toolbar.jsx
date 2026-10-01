import { STATUSES } from '../data/plants.js';

export default function Toolbar({
    plants,
    rooms,
    filters,
    onFiltersChange,
    sortBy,
    onSortChange,
    isReversed,
    onReverse,
    visibleCount,
}) {
    console.log('[render] Toolbar');

    function setFilter(field, value) {
        onFiltersChange({ ...filters, [field]: value });
    }

    const statusOptions = [{ value: 'all', label: 'All' }, ...STATUSES];

    return (
        <section className="toolbar" aria-label="Filter and sort plants">
            <div className="toolbar__row">
                <label className="search">
                    <span className="sr-only">Search plants</span>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                        <circle cx="8.5" cy="8.5" r="5.5" />
                        <path d="m13 13 4 4" />
                    </svg>
                    <input
                        type="search"
                        value={filters.query}
                        onChange={(e) => setFilter('query', e.target.value)}
                        placeholder="Search by name or species"
                    />
                </label>

                <label className="inline-field">
                    <span>Room</span>
                    <select value={filters.room} onChange={(e) => setFilter('room', e.target.value)}>
                        <option value="all">All rooms</option>
                        {rooms.map((room) => (
                            <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                </label>

                <label className="inline-field">
                    <span>Sort</span>
                    <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
                        <option value="added">Newest first</option>
                        <option value="name">Name A–Z</option>
                        <option value="water">Water most often</option>
                    </select>
                </label>

                <button
                    type="button"
                    className={`btn btn--ghost ${isReversed ? 'is-active' : ''}`}
                    aria-pressed={isReversed}
                    onClick={onReverse}
                >
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M6 3v14M6 17l-3-3M6 17l3-3M14 17V3M14 3l-3 3M14 3l3 3" />
                    </svg>
                    Reverse
                </button>
            </div>

            <div className="toolbar__row toolbar__row--chips">
                <div className="chips" role="group" aria-label="Filter by status">
                    {statusOptions.map((option) => {
                        const count =
                            option.value === 'all'
                                ? plants.length
                                : plants.filter((p) => p.status === option.value).length;
                        const isActive = filters.status === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                className={`chip chip--${option.value} ${isActive ? 'is-active' : ''}`}
                                aria-pressed={isActive}
                                onClick={() => setFilter('status', option.value)}
                            >
                                {option.label}
                                <span className="chip__count">{count}</span>
                            </button>
                        );
                    })}
                </div>
                <p className="toolbar__count">
                    Showing {visibleCount} of {plants.length}
                </p>
            </div>
        </section>
    );
}
