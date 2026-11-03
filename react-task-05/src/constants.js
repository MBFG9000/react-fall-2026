export const PAGE_SIZE = 6;

export const DEPARTMENTS = ['Command', 'Engineering', 'Medical', 'Navigation', 'Science', 'Security'];

export const STATUSES = [
    { value: 'on-duty', label: 'On duty' },
    { value: 'off-duty', label: 'Off duty' },
    { value: 'on-leave', label: 'On leave' },
];

export const CLEARANCE_LEVELS = [1, 2, 3, 4, 5];

// The fake API sorts by name only.
export const SORTS = [
    { value: 'name', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
];

export const DEFAULT_SORT = 'name';
