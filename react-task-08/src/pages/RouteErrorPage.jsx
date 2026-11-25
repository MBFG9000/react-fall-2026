import { Link, useRouteError } from 'react-router';

// Shown by the router when a page throws while rendering, or when a lazy
// page's code cannot be downloaded (e.g. offline, or after a new deploy).
export default function RouteErrorPage() {
    const error = useRouteError();
    const isChunkError = /dynamically imported module|Failed to fetch|Importing a module script failed/i.test(
        error?.message ?? '',
    );

    return (
        <section className="not-found" role="alert">
            <p className="not-found__code not-found__code--error" aria-hidden="true">
                !
            </p>
            <h1 className="not-found__title">Something went wrong</h1>
            <p className="not-found__text">
                {isChunkError
                    ? 'This page could not be downloaded. Check your connection and reload.'
                    : 'This page crashed while rendering.'}
            </p>
            {error?.message && <pre className="not-found__details">{error.message}</pre>}
            <div className="not-found__actions">
                <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
                    Reload page
                </button>
                <Link to="/" className="btn btn--ghost">
                    Back to Home
                </Link>
            </div>
        </section>
    );
}
