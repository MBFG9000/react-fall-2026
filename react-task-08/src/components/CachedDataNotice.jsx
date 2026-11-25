import { formatDateTime } from '../utils/format.js';

// Shown above data that the Service Worker returned from its cache (offline).
export default function CachedDataNotice({ cachedAt }) {
    return (
        <p className="cached-notice" role="status">
            <span className="cached-notice__dot" aria-hidden="true" />
            You are offline. Showing saved data{cachedAt ? ` from ${formatDateTime(cachedAt)}` : ''}.
        </p>
    );
}
