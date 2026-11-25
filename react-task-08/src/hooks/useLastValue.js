import { useState } from 'react';

/**
 * Returns `value`, or the last value that was not null while `value` is null.
 * Pages use it to keep the previous results on screen (dimmed) while the
 * results for a new filter or page are loading, instead of a skeleton.
 *
 * Setting state during render (with a condition) is how React recommends
 * remembering something from previous renders; it does not loop because the
 * second render already has `last === value`.
 */
export function useLastValue(value) {
    const [last, setLast] = useState(value);
    if (value != null && value !== last) setLast(value);
    return value ?? last;
}
