import { CLEARANCE_LEVELS } from '../constants.js';

export default function ClearanceMeter({ level, compact = false }) {
    return (
        <span className="clearance" role="img" aria-label={`Clearance level ${level} of 5`}>
            {CLEARANCE_LEVELS.map((i) => (
                <span key={i} className={`clearance__pip ${i <= level ? 'clearance__pip--on' : ''}`} />
            ))}
            {!compact && <span className="clearance__text">Level {level}</span>}
        </span>
    );
}
