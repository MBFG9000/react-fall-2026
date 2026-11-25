export function CardGridSkeleton({ count = 6 }) {
    return (
        <ul className="card-grid" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
                <li key={i} className="crew-card crew-card--skeleton">
                    <span className="skeleton skeleton--avatar" />
                    <span className="skeleton skeleton--text" />
                    <span className="skeleton skeleton--text skeleton--short" />
                </li>
            ))}
        </ul>
    );
}

export function DetailsSkeleton() {
    return (
        <div className="details-skeleton" aria-hidden="true">
            <span className="skeleton skeleton--title" />
            <span className="skeleton skeleton--text" />
            <span className="skeleton skeleton--block" />
            <span className="skeleton skeleton--block" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton" aria-hidden="true">
            <div className="kpi-row">
                {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="skeleton skeleton--tile" />
                ))}
            </div>
            <div className="dash-grid">
                <span className="skeleton skeleton--block" />
                <span className="skeleton skeleton--block" />
            </div>
        </div>
    );
}
