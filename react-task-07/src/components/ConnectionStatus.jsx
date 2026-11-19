import { useEffect, useState } from 'react';

// Online / offline pill in the navigation bar. It follows the browser's
// `online` and `offline` events.
export default function ConnectionStatus() {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    return (
        <span className={`conn conn--${online ? 'online' : 'offline'}`} role="status">
            <span className="conn__dot" aria-hidden="true" />
            <span className="conn__label">{online ? 'Online' : 'Offline'}</span>
        </span>
    );
}
