import { useState } from 'react';
import { STATUSES, ROOMS, LIGHT_LEVELS } from '../data/plants.js';

const EMPTY_FORM = {
    name: '',
    species: '',
    room: ROOMS[0],
    light: LIGHT_LEVELS[1],
    waterEveryDays: 7,
    status: 'thriving',
};

// Child component with its OWN state: the form fields.
// The parent only learns about the new plant when the form is submitted.
export default function AddPlantForm({ onAdd }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    console.log('[render] AddPlantForm', form);

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (error) setError('');
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (form.name.trim() === '') {
            setError('Give the plant a name.');
            return;
        }
        onAdd({
            ...form,
            name: form.name.trim(),
            species: form.species.trim() || 'Unknown species',
            waterEveryDays: Math.max(1, Number(form.waterEveryDays) || 1),
        });
        setForm(EMPTY_FORM);
    }

    return (
        <form className="panel add-form" onSubmit={handleSubmit} noValidate>
            <h2 className="panel__title">Add a plant</h2>

            <label className="field">
                <span>Name</span>
                <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Peace lily"
                    aria-invalid={error ? 'true' : 'false'}
                />
            </label>
            {error && <p className="field__error">{error}</p>}

            <label className="field">
                <span>Species</span>
                <input
                    value={form.species}
                    onChange={(e) => update('species', e.target.value)}
                    placeholder="Spathiphyllum wallisii"
                />
            </label>

            <div className="field-row">
                <label className="field">
                    <span>Room</span>
                    <select value={form.room} onChange={(e) => update('room', e.target.value)}>
                        {ROOMS.map((room) => (
                            <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                </label>
                <label className="field">
                    <span>Light</span>
                    <select value={form.light} onChange={(e) => update('light', e.target.value)}>
                        {LIGHT_LEVELS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="field-row">
                <label className="field">
                    <span>Water every, days</span>
                    <input
                        type="number"
                        min="1"
                        max="60"
                        value={form.waterEveryDays}
                        onChange={(e) => update('waterEveryDays', e.target.value)}
                    />
                </label>
                <label className="field">
                    <span>Status</span>
                    <select value={form.status} onChange={(e) => update('status', e.target.value)}>
                        {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            <button type="submit" className="btn btn--primary">Add plant</button>
        </form>
    );
}
