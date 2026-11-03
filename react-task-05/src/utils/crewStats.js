import { CLEARANCE_LEVELS, DEPARTMENTS, STATUSES } from '../constants.js';
import { yearsSince } from './format.js';

// Pure functions: turn the API response (a list of crew members) into the
// numbers the dashboard shows. No filtering happens here; the list already
// arrives filtered from the server.

function average(values) {
    const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
    return valid.length ? valid.reduce((sum, v) => sum + v, 0) / valid.length : null;
}

function countBy(items, getKey, keys) {
    const counts = new Map(keys.map((key) => [key, 0]));
    for (const item of items) {
        const key = getKey(item);
        if (counts.has(key)) counts.set(key, counts.get(key) + 1);
    }
    return counts;
}

export function computeCrewStats(crew) {
    const total = crew.length;
    const onDuty = crew.filter((m) => m.status === 'on-duty').length;
    const distinctSkills = new Set(crew.flatMap((m) => m.skills ?? []).map((s) => s.toLowerCase())).size;
    const homeworlds = new Set(crew.map((m) => m.homeworld).filter(Boolean)).size;

    const departmentCounts = countBy(crew, (m) => m.department, DEPARTMENTS);
    const byDepartment = DEPARTMENTS.map((name) => ({ key: name, label: name, count: departmentCounts.get(name) }))
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const statusCounts = countBy(crew, (m) => m.status, STATUSES.map((s) => s.value));
    const byStatus = STATUSES.map((s) => ({ key: s.value, label: s.label, count: statusCounts.get(s.value) }));

    const clearanceCounts = countBy(crew, (m) => m.clearance, CLEARANCE_LEVELS);
    const byClearance = CLEARANCE_LEVELS.map((level) => ({
        key: level,
        label: `Level ${level}`,
        count: clearanceCounts.get(level),
    }));

    const newest = [...crew]
        .filter((m) => m.joinedAt)
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
        .slice(0, 4);

    const senior = [...crew]
        .filter((m) => (m.clearance ?? 0) >= 4)
        .sort((a, b) => b.clearance - a.clearance || a.name.localeCompare(b.name))
        .slice(0, 4);

    return {
        total,
        onDuty,
        averageClearance: average(crew.map((m) => m.clearance)),
        averageYearsAboard: average(crew.map((m) => yearsSince(m.joinedAt))),
        distinctSkills,
        homeworlds,
        byDepartment,
        byStatus,
        byClearance,
        newest,
        senior,
    };
}
