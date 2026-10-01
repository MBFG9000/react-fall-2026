import PlantCard from './PlantCard.jsx';

export default function PlantList({
    plants,
    visibleIds,
    keyMode,
    onRemove,
    onStatusChange,
    onReset,
    onClearFilters,
}) {
    console.log('[render] PlantList', plants.map((p) => p.name));

    if (plants.length === 0) {
        return (
            <div className="empty">
                <h2>Your glasshouse is empty</h2>
                <p>Add your first plant with the form to start tracking its care.</p>
            </div>
        );
    }

    return (
        <>
            {visibleIds.size === 0 && (
                <div className="empty">
                    <h2>No plants match these filters</h2>
                    <button type="button" className="btn btn--primary" onClick={onClearFilters}>
                        Clear filters
                    </button>
                </div>
            )}

            <ul className="grid">
                {plants.map((plant, index) => (
                    <PlantCard
                        // Stable key: the plant id (+ resetCount for intentional reset).
                        // Index key is only here for the Key experiment demo.
                        key={keyMode === 'id' ? `${plant.id}-${plant.resetCount}` : index}
                        plant={plant}
                        // Filtered-out cards stay mounted but hidden, so their
                        // local state survives when the filter is cleared.
                        isHidden={!visibleIds.has(plant.id)}
                        onRemove={onRemove}
                        onStatusChange={onStatusChange}
                        onReset={onReset}
                    />
                ))}
            </ul>
        </>
    );
}
