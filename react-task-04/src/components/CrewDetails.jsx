import { formatDate, formatDateTime, statusLabel } from '../constants.js';

function ClearanceMeter({ level }) {
    return (
        <span className="clearance" aria-label={`Level ${level} of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`clearance__pip ${i <= level ? 'clearance__pip--on' : ''}`} />
            ))}
            <span className="clearance__text">Level {level}</span>
        </span>
    );
}

export default function CrewDetails({
    selectedId,
    summary,
    details,
    status,
    error,
    pendingAction,
    onRetry,
    onClose,
    onToggleDuty,
    onEdit,
    onDelete,
}) {
    if (selectedId === null) {
        return (
            <div className="state state--quiet">
                <p className="state__title">No crew member selected</p>
                <p className="state__text">Pick someone from the list to load their full record.</p>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="state" role="status">
                <p className="state__text">
                    Loading record{summary ? ` for ${summary.name}` : ''}…
                </p>
                <div className="details-skeleton" aria-hidden="true">
                    <span className="skeleton skeleton--title" />
                    <span className="skeleton skeleton--text" />
                    <span className="skeleton skeleton--block" />
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="state state--error" role="alert">
                <p className="state__title">Could not load this record</p>
                <p className="state__text">{error}</p>
                <div className="state__actions">
                    <button type="button" className="btn btn--primary" onClick={onRetry}>
                        Try again
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!details) return null;

    const isBusy = Boolean(pendingAction);
    const isOnDuty = details.status === 'on-duty';

    return (
        <article className="details">
            <div className="details__head">
                <div>
                    <p className="details__eyebrow">
                        #{details.id} · {details.callsign || 'No callsign'}
                    </p>
                    <h2 className="details__name">{details.name}</h2>
                    <p className="details__role">{details.description}</p>
                </div>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
                    ×
                </button>
            </div>

            <div className="duty">
                <span className={`badge badge--large badge--${details.status}`}>{statusLabel(details.status)}</span>
                <button
                    type="button"
                    className={`btn ${isOnDuty ? 'btn--ghost' : 'btn--primary'}`}
                    disabled={isBusy}
                    onClick={() => onToggleDuty(details)}
                >
                    {pendingAction === 'status' ? 'Updating…' : isOnDuty ? 'Stand down' : 'Report for duty'}
                </button>
            </div>

            <dl className="facts">
                <div>
                    <dt>Department</dt>
                    <dd>{details.department || '—'}</dd>
                </div>
                <div>
                    <dt>Homeworld</dt>
                    <dd>{details.homeworld || '—'}</dd>
                </div>
                <div>
                    <dt>Clearance</dt>
                    <dd>{details.clearance ? <ClearanceMeter level={details.clearance} /> : '—'}</dd>
                </div>
                <div>
                    <dt>Joined</dt>
                    <dd>{formatDate(details.joinedAt)}</dd>
                </div>
            </dl>

            <div className="details__section">
                <h3 className="details__label">Skills</h3>
                {details.skills?.length ? (
                    <ul className="chips">
                        {details.skills.map((skill) => (
                            <li key={skill} className="chip">{skill}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="muted">No skills listed.</p>
                )}
            </div>

            <div className="details__section">
                <h3 className="details__label">Bio</h3>
                <p className="details__bio">{details.bio || 'No bio yet.'}</p>
            </div>

            <p className="details__updated">Last updated {formatDateTime(details.updatedAt)}</p>

            <div className="details__actions">
                <button type="button" className="btn btn--ghost" disabled={isBusy} onClick={() => onEdit(details)}>
                    Edit
                </button>
                <button type="button" className="btn btn--danger" disabled={isBusy} onClick={() => onDelete(details)}>
                    {pendingAction === 'delete' ? 'Removing…' : 'Remove'}
                </button>
            </div>
        </article>
    );
}
