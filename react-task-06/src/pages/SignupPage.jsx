import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { setPageTitle } from '../utils/pageTitle.js';

// Returns the first problem with the form, or null when everything is fine.
// Firebase checks these too, but checking first gives a faster, clearer message.
function validate(email, password, confirmPassword) {
    if (!email.trim() || !password || !confirmPassword) return 'Fill in all fields.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Enter a valid email address.';
    if (password.length < 6) return 'The password must be at least 6 characters.';
    if (password !== confirmPassword) return 'The passwords do not match.';
    return null;
}

export default function SignupPage() {
    const { user, signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setPageTitle('Sign up');
    }, []);

    // A new account is signed in right away, so on success the <Navigate> below
    // sends the user to the profile (same as on the login page).
    async function handleSubmit(e) {
        e.preventDefault();
        const problem = validate(email, password, confirmPassword);
        if (problem) {
            setError(problem);
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await signup(email.trim(), password);
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    }

    if (user) return <Navigate to="/profile" replace />;

    return (
        <div className="auth">
            <form className="auth__card panel" onSubmit={handleSubmit} noValidate>
                <svg className="auth__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10" cy="8" r="4" />
                    <path d="M3 20c1.3-3.6 3.9-5.5 7-5.5s5.7 1.9 7 5.5M19 8v6M16 11h6" />
                </svg>
                <h1 className="auth__title">Create an account</h1>
                <p className="auth__lead">Sign up with your email. The password needs at least 6 characters.</p>

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
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Confirm password</span>
                    <input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </label>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" className="btn btn--primary auth__submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account…' : 'Sign up'}
                </button>

                <p className="auth__footer">
                    <span className="muted">Already have an account?</span>
                    <Link to="/login">Log in →</Link>
                </p>
            </form>
        </div>
    );
}
