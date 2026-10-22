export const PAGE_SIZE = 6;

export const DEPARTMENTS = ['Command', 'Engineering', 'Medical', 'Navigation', 'Science', 'Security'];

export const STATUSES = [
    { value: 'on-duty', label: 'On duty' },
    { value: 'off-duty', label: 'Off duty' },
    { value: 'on-leave', label: 'On leave' },
];

export const SORTS = [
    { value: 'name', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
];

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
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
