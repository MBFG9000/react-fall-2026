export default function StatTile({ label, value, detail }) {
    return (
        <div className="stat-tile">
            <p className="stat-tile__label">{label}</p>
            <p className="stat-tile__value">{value}</p>
            {detail && <p className="stat-tile__detail">{detail}</p>}
        </div>
    );
}
