import { STATUSES } from '../constants.js';

export function statusLabel(value) {
    return STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/** Whole + fractional years between an ISO date and now (never negative). */
export function yearsSince(iso) {
    if (!iso) return null;
    const ms = Date.now() - new Date(iso).getTime();
    return Number.isFinite(ms) ? Math.max(0, ms / YEAR_MS) : null;
}

export function formatServiceLength(iso) {
    const years = yearsSince(iso);
    if (years === null) return '—';
    if (years < 1) {
        const months = Math.max(1, Math.round(years * 12));
        return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const rounded = Math.round(years * 10) / 10;
    return `${rounded} ${rounded === 1 ? 'year' : 'years'}`;
}

export function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export function percent(part, whole) {
    return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
