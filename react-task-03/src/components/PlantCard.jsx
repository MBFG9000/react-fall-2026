import { useState } from 'react';
import { STATUSES } from '../data/plants.js';

function Drop({ filled }) {
    return (
        <svg className={`drop ${filled ? 'drop--filled' : ''}`} viewBox="0 0 12 16" aria-hidden="true">
            <path d="M6 1C6 1 1 7 1 10.5a5 5 0 0 0 10 0C11 7 6 1 6 1Z" />
        </svg>
    );
}

export default function PlantCard({ plant, isHidden, onRemove, onStatusChange, onReset }) {
    // ----- Local state: belongs to THIS card only, the parent never sees it -----
    // The lazy initializer runs only when the card is mounted (created),
    // so this log tells a fresh mount apart from an ordinary re-render.
    const [waterings, setWaterings] = useState(() => {
        console.log(`%c[mount] PlantCard "${plant.name}"`, 'color: #3E7C4F; font-weight: bold');
        return 0;
    });
    const [note, setNote] = useState('');
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    console.log(`[render] PlantCard "${plant.name}"`, { waterings, note, isNotesOpen, isHidden });

    const hasLocalChanges = waterings > 0 || note !== '' || isNotesOpen;
    const shownDrops = Math.min(waterings, 5);

    return (
        <li className={`card card--${plant.status}`} hidden={isHidden}>
            <div className="card__head">
                <div>
                    <h3 className="card__name">{plant.name}</h3>
                    <p className="card__species">{plant.species}</p>
                </div>
                <label className={`status status--${plant.status}`}>
                    <span className="sr-only">Status of {plant.name}</span>
                    <select value={plant.status} onChange={(e) => onStatusChange(plant.id, e.target.value)}>
                        {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            <dl className="facts">
                <div>
                    <dt>Room</dt>
                    <dd>{plant.room}</dd>
                </div>
                <div>
                    <dt>Light</dt>
                    <dd>{plant.light}</dd>
                </div>
                <div>
                    <dt>Water</dt>
                    <dd>every {plant.waterEveryDays} {plant.waterEveryDays === 1 ? 'day' : 'days'}</dd>
                </div>
            </dl>

            <div className="session">
                <div className="session__drops" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <Drop key={i} filled={i < shownDrops} />
                    ))}
                </div>
                <p className="session__text">
                    {waterings === 0
                        ? 'Not watered this session'
                        : `Watered ${waterings} ${waterings === 1 ? 'time' : 'times'} this session`}
                </p>
                <button type="button" className="btn btn--water" onClick={() => setWaterings((w) => w + 1)}>
                    Log watering
                </button>
            </div>

            {plant.status === 'thirsty' && waterings === 0 && (
                <p className="card__hint">Soil is dry. This one is due for water.</p>
            )}

            <button
                type="button"
                className="notes-toggle"
                aria-expanded={isNotesOpen}
                onClick={() => setIsNotesOpen((open) => !open)}
            >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="m4 2 4 4-4 4" />
                </svg>
                Care notes
            </button>

            {isNotesOpen ? (
                <textarea
                    className="notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Yellow leaf on the left stem, moved closer to the window…"
                    rows={3}
                />
            ) : (
                note && <p className="notes-preview">{note}</p>
            )}

            <div className="card__actions">
                <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    disabled={!hasLocalChanges}
                    onClick={() => onReset(plant.id)}
                    title="Clears waterings and notes for this card"
                >
                    Reset card
                </button>
                <button type="button" className="btn btn--danger btn--small" onClick={() => onRemove(plant.id)}>
                    Remove
                </button>
            </div>
        </li>
    );
}
