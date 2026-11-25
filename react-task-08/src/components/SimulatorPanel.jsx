import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetCrewData } from '../features/crew/crewThunks.js';
import { noticeShown } from '../features/notifications/notificationsSlice.js';
import { applyNetworkPreset, NETWORK_PRESETS } from '../services/crewApi.js';

// Controls for the fake server: network speed / error rate and "reset data".
// Lives in RootLayout, so the chosen preset stays while moving between pages.
export default function SimulatorPanel() {
    const dispatch = useDispatch();
    const [preset, setPreset] = useState('normal');

    // Sync an external system (the fake API config) with React state.
    useEffect(() => {
        applyNetworkPreset(preset);
    }, [preset]);

    async function handleReset() {
        if (!window.confirm('Restore the original crew? All changes will be lost.')) return;
        // The thunk restores the data and raises the crew `version`, so the open page loads it again.
        await dispatch(resetCrewData()).unwrap();
        dispatch(noticeShown('success', 'Crew data restored.'));
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
