import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestLogCleared, selectLogEntries, selectStaleCount } from '../features/requestLog/requestLogSlice.js';

const OUTCOME_TEXT = { ok: 'OK', error: 'Failed', stale: 'Ignored (stale)' };

// The crew thunks write every finished request into the requestLog slice;
// this component only shows it. Open / closed is temporary UI state, so it stays local.
export default function RequestLog() {
    const dispatch = useDispatch();
    const entries = useSelector(selectLogEntries);
    const staleCount = useSelector(selectStaleCount);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="log">
            <div className="log__head">
                <button type="button" className="log__toggle" aria-expanded={isOpen} onClick={() => setIsOpen((o) => !o)}>
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="m4 2 4 4-4 4" />
                    </svg>
                    Request log
                    <span className="muted">
                        {entries.length} requests · {staleCount} stale responses ignored
                    </span>
                </button>
                {entries.length > 0 && (
                    <button type="button" className="btn btn--ghost btn--small" onClick={() => dispatch(requestLogCleared())}>
                        Clear
                    </button>
                )}
            </div>

            {isOpen &&
                (entries.length === 0 ? (
                    <p className="muted log__empty">No requests finished yet.</p>
                ) : (
                    <ol className="log__list">
                        {entries.map((entry) => (
                            <li key={entry.id} className={`log__row log__row--${entry.outcome}`}>
                                <span className="log__outcome">{OUTCOME_TEXT[entry.outcome]}</span>
                                <code className="log__label">{entry.label}</code>
                                <span className="log__ms">{(entry.ms / 1000).toFixed(1)} s</span>
                            </li>
                        ))}
                    </ol>
                ))}
        </section>
    );
}
