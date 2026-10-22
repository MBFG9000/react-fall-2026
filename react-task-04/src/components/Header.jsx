import { NETWORK_PRESETS } from '../api/crewApi.js';

export default function Header({ total, listStatus, preset, onPresetChange, onResetData }) {
    return (
        <header className="header">
            <div className="header__brand">
                <svg className="header__logo" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="16" cy="16" r="13" />
                    <path d="M3 16h26M16 3c4 4 5.5 8.5 5.5 13S20 25 16 29M16 3c-4 4-5.5 8.5-5.5 13S12 25 16 29" />
                </svg>
                <div>
                    <h1 className="header__title">Meridian Crew Roster</h1>
                    <p className="header__subtitle">
                        {listStatus === 'success'
                            ? `${total} ${total === 1 ? 'crew member matches' : 'crew members match'} the current view`
                            : 'Research vessel personnel records'}
                    </p>
                </div>
            </div>

            <div className="header__controls">
                <label className="field field--inline">
                    <span className="field__label">Network</span>
                    <select value={preset} onChange={(e) => onPresetChange(e.target.value)}>
                        {Object.entries(NETWORK_PRESETS).map(([key, p]) => (
                            <option key={key} value={key}>{p.label}</option>
                        ))}
                    </select>
                </label>
                <button type="button" className="btn btn--ghost btn--small" onClick={onResetData}>
                    Reset data
                </button>
            </div>
        </header>
    );
}
