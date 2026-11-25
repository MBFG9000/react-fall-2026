import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { setPageTitle } from '../utils/pageTitle.js';

export default function LoginPage() {
    const { user, login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setPageTitle('Log in');
    }, []);

    // On success we do not navigate here: onAuthStateChanged sets `user`,
    // and the <Navigate> below sends the user to the profile.
    async function handleSubmit(e) {
        e.preventDefault();
        if (!email.trim() || !password) {
            setError('Enter your email and password.');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email.trim(), password);
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    }

    async function handleGoogle() {
        setError(null);
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    }

    // Already signed in (or just signed in): this page is not needed.
    if (user) return <Navigate to="/profile" replace />;

    return (
        <div className="auth">
            <form className="auth__card panel" onSubmit={handleSubmit} noValidate>
                <svg className="auth__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <h1 className="auth__title">Crew sign-in</h1>
                <p className="auth__lead">Log in with your email and password or with your Google account.</p>

                <label className="field">
                    <span className="field__label">Email</span>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Password</span>
                    <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" className="btn btn--primary auth__submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                </button>
                <button type="button" className="btn btn--ghost auth__submit" disabled={isSubmitting} onClick={handleGoogle}>
                    Continue with Google
                </button>

                <p className="auth__footer">
                    <span className="muted">No account yet?</span>
                    <Link to="/signup">Create one →</Link>
                </p>
            </form>
        </div>
    );
}
