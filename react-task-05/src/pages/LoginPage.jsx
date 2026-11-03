import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { setPageTitle } from '../utils/pageTitle.js';

// Placeholder only: there is no authentication yet. The form is laid out the
// way the real one will be, but submitting just explains that.
export default function LoginPage() {
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setPageTitle('Log in');
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    return (
        <div className="auth">
            <form className="auth__card panel" onSubmit={handleSubmit} noValidate>
                <svg className="auth__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <h1 className="auth__title">Crew sign-in</h1>
                <p className="auth__lead">Sign-in is coming in a later version. The crew records are open to everyone for now.</p>

                <label className="field">
                    <span className="field__label">Callsign or email</span>
                    <input type="text" name="username" autoComplete="username" placeholder="e.g. WRENCH" />
                </label>
                <label className="field">
                    <span className="field__label">Access code</span>
                    <input type="password" name="password" autoComplete="current-password" placeholder="••••••••" />
                </label>

                <button type="submit" className="btn btn--primary auth__submit">
                    Sign in
                </button>

                {submitted && (
                    <p className="auth__message" role="status">
                        Authentication isn&apos;t available yet. Nothing was sent.
                    </p>
                )}

                <p className="auth__footer">
                    <span className="badge badge--soon">Coming soon</span>
                    <Link to="/crew">Continue to the crew roster →</Link>
                </p>
            </form>
        </div>
    );
}
