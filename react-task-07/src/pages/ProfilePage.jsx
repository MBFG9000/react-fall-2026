import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { setPageTitle } from '../utils/pageTitle.js';

// Only rendered inside <ProtectedRoute>, so `user` is always set here.
export default function ProfilePage() {
    const { user, logout } = useAuth();

    useEffect(() => {
        setPageTitle('Profile');
    }, []);

    return (
        <div className="auth">
            <section className="auth__card panel">
                <svg className="auth__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                </svg>
                <h1 className="auth__title">Your profile</h1>
                <p className="auth__lead">You are signed in to Meridian Crew.</p>

                <dl className="facts auth__facts">
                    <div>
                        <dt>Email</dt>
                        <dd>{user.email}</dd>
                    </div>
                    <div>
                        <dt>UID</dt>
                        <dd className="mono">{user.uid}</dd>
                    </div>
                </dl>

                {/* After sign-out, ProtectedRoute sends the user to /login. */}
                <button type="button" className="btn btn--ghost auth__submit" onClick={logout}>
                    Log out
                </button>
            </section>
        </div>
    );
}
