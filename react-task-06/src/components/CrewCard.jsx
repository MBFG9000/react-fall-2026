import { Link, useLocation } from 'react-router';
import { initials } from '../utils/format.js';
import ClearanceMeter from './ClearanceMeter.jsx';
import StatusBadge from './StatusBadge.jsx';

// Reusable summary card. Used by the roster grid and the dashboard lists
// (`compact`). The whole card is a link to the member's details page.
export default function CrewCard({ member, compact = false }) {
    const location = useLocation();
    const department = member.department?.toLowerCase() ?? 'none';
    return (
        <Link
            to={`/crew/${member.id}`}
            // Remember where we came from (e.g. a filtered roster page), so the
            // details page can return there after removing this member.
            state={{ from: `${location.pathname}${location.search}` }}
            className={`crew-card ${compact ? 'crew-card--compact' : ''}`}
        >
            <span className={`avatar avatar--${department}`} aria-hidden="true">
                {initials(member.name)}
            </span>
            <span className="crew-card__main">
                <span className="crew-card__name">{member.name}</span>
                <span className="crew-card__meta">
                    {member.description}
                    {member.department ? ` · ${member.department}` : ''}
                </span>
                {!compact && (
                    <span className="crew-card__footer">
                        {member.clearance ? <ClearanceMeter level={member.clearance} compact /> : <span />}
                        <span className="crew-card__callsign">{member.callsign}</span>
                    </span>
                )}
            </span>
            <StatusBadge status={member.status} />
        </Link>
    );
}
