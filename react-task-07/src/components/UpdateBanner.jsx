import { useEffect, useState } from 'react';

const SW_URL = `${import.meta.env.BASE_URL}sw.js`;
const UPDATE_CHECK_MS = 30 * 60 * 1000; // also ask the server for a new sw.js every 30 min

// Registers the Service Worker and shows a banner when a new version of the
// app has been installed and is waiting. "Update" activates it and reloads.
export default function UpdateBanner() {
    const [waitingWorker, setWaitingWorker] = useState(null);

    useEffect(() => {
        // sw.js only exists in the production build (see vite.config.js).
        if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

        let cancelled = false;
        let timer;

        // `navigator.serviceWorker.controller` is null on the very first visit:
        // then the new worker is the first version, not an update.
        function watch(worker) {
            worker.addEventListener('statechange', () => {
                if (!cancelled && worker.state === 'installed' && navigator.serviceWorker.controller) {
                    setWaitingWorker(worker);
                }
            });
        }

        navigator.serviceWorker
            .register(SW_URL)
            .then((registration) => {
                if (cancelled) return;
                // An update was installed earlier and is still waiting (e.g. after a refresh).
                if (registration.waiting && navigator.serviceWorker.controller) {
                    setWaitingWorker(registration.waiting);
                }
                if (registration.installing) watch(registration.installing);
                registration.addEventListener('updatefound', () => watch(registration.installing));
                timer = setInterval(() => registration.update().catch(() => {}), UPDATE_CHECK_MS);
            })
            .catch((error) => console.error('Service Worker registration failed:', error));

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, []);

    function handleUpdate() {
        // When the new worker takes control, reload once so the page uses the new files.
        navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }

    if (!waitingWorker) return null;

    return (
        <div className="update-banner" role="status">
            <span>A new version of Meridian Crew is available.</span>
            <div className="update-banner__actions">
                <button type="button" className="btn btn--small btn--primary" onClick={handleUpdate}>
                    Update
                </button>
                <button type="button" className="btn btn--small btn--ghost" onClick={() => setWaitingWorker(null)}>
                    Later
                </button>
            </div>
        </div>
    );
}
