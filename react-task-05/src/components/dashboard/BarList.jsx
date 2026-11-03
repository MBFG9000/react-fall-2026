import { Link } from 'react-router';
import { percent } from '../../utils/format.js';

// Ranked horizontal bars in one hue (magnitude, not identity), largest first.
// Every row is a link, e.g. to the roster filtered by that department.
export default function BarList({ rows, total, getHref }) {
    const max = Math.max(1, ...rows.map((row) => row.count));
    return (
        <ul className="bar-list">
            {rows.map((row) => (
                <li key={row.key}>
                    <Link
                        to={getHref(row)}
                        className="bar-list__row"
                        title={`${row.label}: ${row.count} (${percent(row.count, total)}%). Open in the roster`}
                    >
                        <span className="bar-list__label">{row.label}</span>
                        <span className="bar-list__track">
                            <span className="bar-list__bar" style={{ width: `${(row.count / max) * 100}%` }} />
                            <span className="bar-list__value">{row.count}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
