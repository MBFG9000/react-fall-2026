import { requestLogged } from '../features/requestLog/requestLogSlice.js';

/**
 * Turns an Error into a plain object for `rejectWithValue`. Redux state and
 * actions should only hold plain, serializable values, and createAsyncThunk
 * would drop our own fields (`notFound`, `offline`) from a thrown Error.
 */
export function toErrorPayload(error) {
    return {
        message: error?.message || 'Something went wrong.',
        notFound: Boolean(error?.notFound),
        offline: Boolean(error?.offline),
    };
}

/**
 * The body of every crew thunk: runs one API call, writes the outcome to the
 * request log, and returns the data or a rejected value.
 *
 * An answer is "stale" (and thrown away) when
 *   - the thunk was aborted: the page was left, or its filters changed (see the hooks), or
 *   - `isLatest()` says a newer request for the same data has started since (e.g. Reload).
 */
export async function runRequest(label, request, thunkApi, isLatest = () => true) {
    const { dispatch, signal, rejectWithValue } = thunkApi;
    const startedAt = Date.now();
    try {
        const data = await request();
        if (signal.aborted || !isLatest()) {
            dispatch(requestLogged(label, 'stale', startedAt));
            return rejectWithValue({ message: 'Stale response ignored.', stale: true });
        }
        dispatch(requestLogged(label, 'ok', startedAt));
        return data;
    } catch (error) {
        const stale = signal.aborted || !isLatest();
        dispatch(requestLogged(label, stale ? 'stale' : 'error', startedAt));
        return rejectWithValue(toErrorPayload(error));
    }
}
