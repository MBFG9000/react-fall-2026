// Lets you switch the list keys between stable ids and array indexes,
// so the effect of keys on local state can be shown live during the defence.
export default function KeyExperiment({ keyMode, onChange }) {
    console.log('[render] KeyExperiment', keyMode);

    return (
        <section className="panel key-panel">
            <h2 className="panel__title">Key experiment</h2>
            <p className="panel__text">
                Choose what React uses as each card&rsquo;s key. Log a watering or write a note,
                then reverse or sort the list to see the difference.
            </p>
            <div className="segmented" role="radiogroup" aria-label="List key strategy">
                <button
                    type="button"
                    role="radio"
                    aria-checked={keyMode === 'id'}
                    className={keyMode === 'id' ? 'is-active' : ''}
                    onClick={() => onChange('id')}
                >
                    Plant id
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={keyMode === 'index'}
                    className={keyMode === 'index' ? 'is-active' : ''}
                    onClick={() => onChange('index')}
                >
                    Array index
                </button>
            </div>
            {keyMode === 'index' ? (
                <p className="key-panel__note key-panel__note--warn">
                    Index keys follow the position, not the plant. After a reorder, notes and
                    waterings stay in place while the plants move, and Reset card stops working.
                </p>
            ) : (
                <p className="key-panel__note">
                    Each card is keyed by its id, so its local state travels with the plant.
                </p>
            )}
        </section>
    );
}
