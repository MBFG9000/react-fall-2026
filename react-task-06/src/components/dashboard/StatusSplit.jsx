import { Link } from 'react-router';
import { percent } from '../../utils/format.js';

// One whole (the crew in view) split by duty status: a thin segmented bar,
// with the names and numbers in the list below it (the swatches act as the legend).
export default function StatusSplit({ rows, total, getHref }) {
    const label = rows.map((row) => `${row.label} ${row.count}`).join(', ');
    return (
        <div className="status-split">
            <div className="status-split__bar" role="img" aria-label={`Duty status: ${label}`}>
                {rows
                    .filter((row) => row.count > 0)
                    .map((row) => (
                        <span
                            key={row.key}
                            className={`status-split__segment status-split__segment--${row.key}`}
                            style={{ flexGrow: row.count }}
                            title={`${row.label}: ${row.count} (${percent(row.count, total)}%)`}
                        />
                    ))}
            </div>
            <ul className="status-split__list">
                {rows.map((row) => (
                    <li key={row.key}>
                        <Link to={getHref(row)} className="status-split__row">
                            <span className={`swatch swatch--${row.key}`} aria-hidden="true" />
                            <span className="status-split__name">{row.label}</span>
                            <span className="status-split__count">{row.count}</span>
                            <span className="status-split__share">{percent(row.count, total)}%</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
