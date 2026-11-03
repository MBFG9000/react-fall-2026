import { useEffect, useState } from 'react';
import { DEPARTMENTS, STATUSES } from '../constants.js';

const EMPTY = {
    name: '',
    description: '',
    department: DEPARTMENTS[0],
    status: 'off-duty',
    homeworld: '',
    clearance: 1,
    callsign: '',
    joinedAt: new Date().toISOString().slice(0, 10),
    skills: '',
    bio: '',
};

function toForm(member) {
    if (!member) return EMPTY;
    return {
        name: member.name ?? '',
        description: member.description ?? '',
        department: member.department ?? DEPARTMENTS[0],
        status: member.status ?? 'off-duty',
        homeworld: member.homeworld ?? '',
        clearance: member.clearance ?? 1,
        callsign: member.callsign ?? '',
        joinedAt: member.joinedAt ?? '',
        skills: (member.skills ?? []).join(', '),
        bio: member.bio ?? '',
    };
}

function toPayload(form) {
    return {
        name: form.name.trim(),
        description: form.description.trim(),
        department: form.department,
        status: form.status,
        homeworld: form.homeworld.trim(),
        clearance: Number(form.clearance),
        callsign: form.callsign.trim().toUpperCase(),
        joinedAt: form.joinedAt,
        skills: form.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        bio: form.bio.trim(),
    };
}

export default function CrewForm({ mode, member, onCreate, onSave, onClose }) {
    const [form, setForm] = useState(() => toForm(member));
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Close on Escape. The listener is removed in cleanup, and re-added with
    // the current isSaving value whenever it changes.
    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape' && !isSaving) onClose();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isSaving, onClose]);

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const payload = toPayload(form);
        if (!payload.name || !payload.description) {
            setError('Name and role are required.');
            return;
        }
        setError(null);
        setIsSaving(true);
        try {
            if (mode === 'create') await onCreate(payload);
            else await onSave(member.id, payload); // id comes from the member this form was opened for
        } catch (err) {
            setError(err.message);
            setIsSaving(false);
        }
    }

    const title = mode === 'create' ? 'New crew member' : `Edit ${member.name}`;

    return (
        <div className="modal" role="presentation" onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}>
            <form className="modal__card" role="dialog" aria-modal="true" aria-label={title} onSubmit={handleSubmit}>
                <h2 className="modal__title">{title}</h2>

                <div className="form-grid">
                    <label className="field">
                        <span className="field__label">Name *</span>
                        <input value={form.name} onChange={(e) => update('name', e.target.value)} autoFocus />
                    </label>
                    <label className="field">
                        <span className="field__label">Role *</span>
                        <input
                            value={form.description}
                            onChange={(e) => update('description', e.target.value)}
                            placeholder="e.g. Pilot"
                        />
                    </label>
                    <label className="field">
                        <span className="field__label">Department</span>
                        <select value={form.department} onChange={(e) => update('department', e.target.value)}>
                            {DEPARTMENTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </label>
                    <label className="field">
                        <span className="field__label">Status</span>
                        <select value={form.status} onChange={(e) => update('status', e.target.value)}>
                            {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="field">
                        <span className="field__label">Homeworld</span>
                        <input value={form.homeworld} onChange={(e) => update('homeworld', e.target.value)} />
                    </label>
                    <label className="field">
                        <span className="field__label">Callsign</span>
                        <input value={form.callsign} onChange={(e) => update('callsign', e.target.value)} />
                    </label>
                    <label className="field">
                        <span className="field__label">Clearance (1–5)</span>
                        <select value={form.clearance} onChange={(e) => update('clearance', e.target.value)}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>Level {n}</option>
                            ))}
                        </select>
                    </label>
                    <label className="field">
                        <span className="field__label">Joined</span>
                        <input type="date" value={form.joinedAt} onChange={(e) => update('joinedAt', e.target.value)} />
                    </label>
                    <label className="field form-grid__wide">
                        <span className="field__label">Skills (comma separated)</span>
                        <input
                            value={form.skills}
                            onChange={(e) => update('skills', e.target.value)}
                            placeholder="Piloting, First aid"
                        />
                    </label>
                    <label className="field form-grid__wide">
                        <span className="field__label">Bio</span>
                        <textarea rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
                    </label>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="modal__actions">
                    <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn--primary" disabled={isSaving}>
                        {isSaving ? 'Saving…' : mode === 'create' ? 'Add to crew' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
