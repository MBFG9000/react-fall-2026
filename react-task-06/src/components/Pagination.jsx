// Page numbers around the current page, with gaps: 1 … 4 5 6 … 12
function pageWindow(page, totalPages) {
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const result = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) result.push(`gap-${p}`);
        result.push(p);
    });
    return result;
}

export default function Pagination({ page, totalPages, total, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
        <nav className="pager" aria-label="Pages">
            <button
                type="button"
                className="btn btn--ghost btn--small"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Prev
            </button>

            <ol className="pager__pages">
                {pageWindow(page, totalPages).map((p) =>
                    typeof p === 'string' ? (
                        <li key={p} className="pager__gap" aria-hidden="true">…</li>
                    ) : (
                        <li key={p}>
                            <button
                                type="button"
                                className={`pager__page ${p === page ? 'pager__page--current' : ''}`}
                                aria-current={p === page ? 'page' : undefined}
                                onClick={() => onPageChange(p)}
                            >
                                {p}
                            </button>
                        </li>
                    ),
                )}
            </ol>

            <span className="pager__info">{total} total</span>

            <button
                type="button"
                className="btn btn--ghost btn--small"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next →
            </button>
        </nav>
    );
}
