import { useEffect, useState } from 'react';
import { applyNetworkPreset, NETWORK_PRESETS, resetDatabase } from '../services/service.js';

// Controls for the fake server: network speed / error rate and "reset data".
// Lives in RootLayout, so the chosen preset stays while moving between pages.
export default function SimulatorPanel({ onReset }) {
    const [preset, setPreset] = useState('normal');

    // Sync an external system (the fake API config) with React state.
    useEffect(() => {
        applyNetworkPreset(preset);
    }, [preset]);

    function handleReset() {
        if (!window.confirm('Restore the original crew? All changes will be lost.')) return;
        resetDatabase();
        onReset(); // tells the layout, which makes the open page load its data again
    }

    return (
        <div className="simulator">
            <label className="field field--inline">
                <span className="field__label">Network</span>
                <select value={preset} onChange={(e) => setPreset(e.target.value)}>
                    {Object.entries(NETWORK_PRESETS).map(([key, p]) => (
                        <option key={key} value={key}>{p.label}</option>
                    ))}
                </select>
            </label>
            <button type="button" className="btn btn--ghost btn--small" onClick={handleReset}>
                Reset data
            </button>
        </div>
    );
}
