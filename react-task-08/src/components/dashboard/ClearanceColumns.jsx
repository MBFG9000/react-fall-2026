// Columns for clearance levels 1–5 (an ordered scale), one hue, value on the cap.
export default function ClearanceColumns({ rows }) {
    const max = Math.max(1, ...rows.map((row) => row.count));
    return (
        <div className="columns">
            <ol className="columns__plot" aria-hidden="true">
                {rows.map((row) => (
                    <li key={row.key} className="columns__item" title={`${row.label}: ${row.count}`}>
                        <span className="columns__value">{row.count}</span>
                        <span className="columns__bar" style={{ height: `${(row.count / max) * 100}%` }} />
                        <span className="columns__label">L{row.key}</span>
                    </li>
                ))}
            </ol>
            <table className="sr-only">
                <caption>Crew per clearance level</caption>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.key}>
                            <th scope="row">{row.label}</th>
                            <td>{row.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
