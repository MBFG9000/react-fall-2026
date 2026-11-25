import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { setPageTitle } from '../utils/pageTitle.js';

export default function NotFoundPage() {
    const { pathname } = useLocation();

    useEffect(() => {
        setPageTitle('Page not found');
    }, []);

    return (
        <section className="not-found">
            <p className="not-found__code" aria-hidden="true">
                404
            </p>
            <h1 className="not-found__title">Lost in space</h1>
            <p className="not-found__text">
                There is nothing at <code>{pathname}</code>. The address may be mistyped, or the page has moved.
            </p>
            <div className="not-found__actions">
                <Link to="/" className="btn btn--primary">
                    Back to Home
                </Link>
                <Link to="/crew" className="btn btn--ghost">
                    Crew roster
                </Link>
            </div>
        </section>
    );
}
