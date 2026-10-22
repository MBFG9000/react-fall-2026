import { statusLabel } from '../constants.js';

const PENDING_TEXT = { status: 'Updating…', save: 'Saving…', delete: 'Removing…' };

function SkeletonRows() {
    return (
        <ul className="crew-list" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
                <li key={i} className="row row--skeleton">
                    <span className="skeleton skeleton--avatar" />
                    <span className="skeleton skeleton--text" />
                </li>
            ))}
        </ul>
    );
}

function initials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function CrewList({
    items,
    status,
    error,
    search,
    selectedId,
    pending,
    page,
    totalPages,
    total,
    onSelect,
    onRetry,
    onPageChange,
    onClearSearch,
}) {
    const isLoading = status === 'loading';
    const hasItems = items.length > 0;

    // First load (nothing to show yet)
    if (isLoading && !hasItems) {
        return (
            <div className="state" role="status">
                <p className="state__text">Loading crew…</p>
                <SkeletonRows />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="state state--error" role="alert">
                <p className="state__title">Could not load the crew list</p>
                <p className="state__text">{error}</p>
                <button type="button" className="btn btn--primary" onClick={onRetry}>
                    Try again
                </button>
            </div>
        );
    }

    if (status === 'success' && !hasItems) {
        return search.trim() ? (
            <div className="state">
                <p className="state__title">No one matches “{search.trim()}”</p>
                <button type="button" className="btn btn--ghost" onClick={onClearSearch}>
                    Clear search
                </button>
            </div>
        ) : (
            <div className="state">
                <p className="state__title">The roster is empty</p>
                <p className="state__text">Add the first crew member with “New member”.</p>
            </div>
        );
    }

    return (
        <div className={`list-wrap ${isLoading ? 'list-wrap--refreshing' : ''}`} aria-busy={isLoading}>
            {isLoading && <div className="refresh-bar" role="status">Refreshing…</div>}

            <ul className="crew-list">
                {items.map((member) => {
                    const action = pending[member.id];
                    return (
                        <li key={member.id}>
                            <button
                                type="button"
                                className={`row ${member.id === selectedId ? 'row--selected' : ''}`}
                                aria-pressed={member.id === selectedId}
                                onClick={() => onSelect(member.id)}
                            >
                                <span className={`avatar avatar--${member.department?.toLowerCase() ?? 'none'}`}>
                                    {initials(member.name)}
                                </span>
                                <span className="row__main">
                                    <span className="row__name">{member.name}</span>
                                    <span className="row__meta">
                                        {member.description}
                                        {member.department ? ` · ${member.department}` : ''}
                                    </span>
                                </span>
                                {action ? (
                                    <span className="badge badge--pending">{PENDING_TEXT[action]}</span>
                                ) : (
                                    member.status && (
                                        <span className={`badge badge--${member.status}`}>{statusLabel(member.status)}</span>
                                    )
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {totalPages > 1 && (
                <nav className="pager" aria-label="Pages">
                    <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        ← Prev
                    </button>
                    <span className="pager__info">
                        Page {page} of {totalPages} · {total} total
                    </span>
                    <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next →
                    </button>
                </nav>
            )}
        </div>
    );
}
