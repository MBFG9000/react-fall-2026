import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { setPageTitle } from '../utils/pageTitle.js';

// Shown when a page cannot be opened offline. The Service Worker redirects
// navigations here, and the news pages send the user here when their data was
// never saved. The page is part of the main bundle, which is pre-cached, so it
// works without a connection. `?from=` is the route the user wanted.
export default function OfflinePage() {
    const [searchParams] = useSearchParams();
    const from = safeRoute(searchParams.get('from'));
    const [online, setOnline] = useState(navigator.onLine);
    const [stillOffline, setStillOffline] = useState(false);

    useEffect(() => {
        setPageTitle('Offline');
    }, []);

    // A full page load (not a router navigation), so the request really goes
    // to the network. If it fails, the Service Worker brings us back here.
    function retry() {
        if (!navigator.onLine) {
            setStillOffline(true);
            return;
        }
        window.location.assign(import.meta.env.BASE_URL.replace(/\/$/, '') + from);
    }

    // When the connection comes back, open the wanted page by itself.
    useEffect(() => {
        const goOnline = () => {
            setOnline(true);
            window.location.assign(import.meta.env.BASE_URL.replace(/\/$/, '') + from);
        };
        const goOffline = () => setOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, [from]);

    return (
        <section className="offline">
            <svg className="offline__icon" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M6 18a26 26 0 0 1 36 0M12 25a17 17 0 0 1 24 0M18 32a8 8 0 0 1 12 0" />
                <circle cx="24" cy="38" r="2" />
                <path d="M8 8l32 32" />
            </svg>
            <h1 className="offline__title">No connection to the Meridian network</h1>
            <p className="offline__text">
                {searchParams.has('from') ? (
                    <>
                        <code>{from}</code> was not saved for offline use, so it cannot be opened right now.{' '}
                    </>
                ) : (
                    'You are not connected to the internet. '
                )}
                Pages and news you have already opened still work.
            </p>
            {stillOffline && !online && (
                <p className="offline__hint" role="alert">
                    Still offline. Check Wi-Fi or mobile data and try again.
                </p>
            )}
            <div className="offline__actions">
                <button type="button" className="btn btn--primary" onClick={retry}>
                    Retry Connection
                </button>
                <Link to="/" className="btn btn--ghost">
                    Home
                </Link>
                <Link to="/crew" className="btn btn--ghost">
                    Crew roster
                </Link>
            </div>
        </section>
    );
}

// Only app routes like "/news?page=2"; anything else (e.g. "//evil.com") falls back to Home.
function safeRoute(value) {
    return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
