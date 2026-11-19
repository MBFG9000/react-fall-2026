import { statusLabel } from '../utils/format.js';

export default function StatusBadge({ status, large = false }) {
    if (!status) return null;
    return <span className={`badge badge--${status} ${large ? 'badge--large' : ''}`}>{statusLabel(status)}</span>;
}
