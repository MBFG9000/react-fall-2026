import { useState } from 'react';
import Header from './components/Header.jsx';
import AddPlantForm from './components/AddPlantForm.jsx';
import KeyExperiment from './components/KeyExperiment.jsx';
import Toolbar from './components/Toolbar.jsx';
import PlantList from './components/PlantList.jsx';
import { initialPlants } from './data/plants.js';

const EMPTY_FILTERS = { query: '', status: 'all', room: 'all' };

function sortPlants(plants, sortBy) {
    const copy = [...plants];
    if (sortBy === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'water') return copy.sort((a, b) => a.waterEveryDays - b.waterEveryDays);
    return copy.sort((a, b) => b.addedAt - a.addedAt); // 'added': newest first
}

function matchesFilters(plant, filters) {
    const query = filters.query.trim().toLowerCase();
    const matchesQuery =
        query === '' ||
        plant.name.toLowerCase().includes(query) ||
        plant.species.toLowerCase().includes(query);
    const matchesStatus = filters.status === 'all' || plant.status === filters.status;
    const matchesRoom = filters.room === 'all' || plant.room === filters.room;
    return matchesQuery && matchesStatus && matchesRoom;
}

function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `p${Date.now()}${Math.random()}`;
}

export default function App() {
    // ----- Parent (shared) state -----
    const [plants, setPlants] = useState(initialPlants);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [sortBy, setSortBy] = useState('added');
    const [isReversed, setIsReversed] = useState(false);
    const [keyMode, setKeyMode] = useState('id'); // 'id' (correct) | 'index' (demo of the bug)

    console.log('[render] App', { plants: plants.length, filters, sortBy, isReversed, keyMode });

    // ----- Derived data (computed during render, never stored in state) -----
    const sorted = sortPlants(plants, sortBy);
    const ordered = isReversed ? sorted.reverse() : sorted;
    const visibleIds = new Set(plants.filter((p) => matchesFilters(p, filters)).map((p) => p.id));
    const rooms = [...new Set(plants.map((p) => p.room))].sort();

    // ----- Handlers passed down as props -----
    function handleAdd(newPlant) {
        setPlants((prev) => {
            const nextAddedAt = Math.max(0, ...prev.map((p) => p.addedAt)) + 1;
            return [...prev, { ...newPlant, id: createId(), addedAt: nextAddedAt, resetCount: 0 }];
        });
    }

    function handleRemove(id) {
        setPlants((prev) => prev.filter((p) => p.id !== id));
    }

    function handleStatusChange(id, status) {
        setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    }

    // Changing resetCount changes the card's key -> React unmounts the old
    // card and mounts a fresh one, so all of its local state starts over.
    function handleReset(id) {
        setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, resetCount: p.resetCount + 1 } : p)));
    }

    return (
        <div className="page">
            <Header plants={plants} />

            <div className="layout">
                <aside className="sidebar">
                    <AddPlantForm onAdd={handleAdd} />
                    <KeyExperiment keyMode={keyMode} onChange={setKeyMode} />
                </aside>

                <main className="main">
                    <Toolbar
                        plants={plants}
                        rooms={rooms}
                        filters={filters}
                        onFiltersChange={setFilters}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        isReversed={isReversed}
                        onReverse={() => setIsReversed((r) => !r)}
                        visibleCount={visibleIds.size}
                    />
                    <PlantList
                        plants={ordered}
                        visibleIds={visibleIds}
                        keyMode={keyMode}
                        onRemove={handleRemove}
                        onStatusChange={handleStatusChange}
                        onReset={handleReset}
                        onClearFilters={() => setFilters(EMPTY_FILTERS)}
                    />
                </main>
            </div>
        </div>
    );
}
