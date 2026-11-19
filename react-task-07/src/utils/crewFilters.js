import { DEFAULT_SORT, DEPARTMENTS, SORTS, STATUSES } from '../constants.js';

// Plain functions (no hooks) for the roster filters that live in the URL:
//   /crew?q=doe&department=Science&status=on-duty&sort=name-desc&page=2
// Defaults are left out of the URL, and invalid values (typed by hand or from
// an old link) fall back to the default instead of breaking the page.

export const DEFAULT_FILTERS = {
    search: '',
    department: '',
    status: '',
    sort: DEFAULT_SORT,
    page: 1,
};

// filter name in the code -> parameter name in the URL
const PARAM_NAMES = {
    search: 'q',
    department: 'department',
    status: 'status',
    sort: 'sort',
    page: 'page',
};

function oneOf(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
}

/** URLSearchParams -> filters object with only valid values. */
export function parseCrewFilters(searchParams) {
    const get = (field) => searchParams.get(PARAM_NAMES[field]) ?? '';
    const page = Number(get('page'));
    return {
        search: get('search'),
        department: oneOf(get('department'), DEPARTMENTS, ''),
        status: oneOf(get('status'), STATUSES.map((s) => s.value), ''),
        sort: oneOf(get('sort'), SORTS.map((s) => s.value), DEFAULT_SORT),
        page: Number.isInteger(page) && page > 0 ? page : 1,
    };
}

/** Filters object -> URLSearchParams, without the default values. */
export function toSearchParams(filters) {
    const params = new URLSearchParams();
    for (const [field, name] of Object.entries(PARAM_NAMES)) {
        const value = filters[field];
        if (value !== undefined && value !== DEFAULT_FILTERS[field] && value !== '') {
            params.set(name, String(value));
        }
    }
    return params;
}

/** Link target for the roster with some filters applied, e.g. from the dashboard. */
export function crewListHref(filters = {}) {
    const search = toSearchParams({ ...DEFAULT_FILTERS, ...filters }).toString();
    return search ? `/crew?${search}` : '/crew';
}

/** How many filters are switched on (sort and page do not count). */
export function countActiveFilters(filters) {
    return [filters.search.trim(), filters.department, filters.status].filter(Boolean).length;
}

/** "12" -> 12. "abc", "0", "-3", "1.5" and "12abc" -> null (invalid id). */
export function parseCrewId(raw) {
    return /^[1-9]\d*$/.test(raw ?? '') ? Number(raw) : null;
}
